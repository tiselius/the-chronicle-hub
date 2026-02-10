import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const sanityToken = Deno.env.get("SANITY_WRITE_TOKEN");
    const sanityProjectId = "sx36dzit";
    const sanityDataset = "production";

    if (!stripeKey || !webhookSecret || !sanityToken) {
      throw new Error("Missing required environment variables");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No stripe-signature header");

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    logStep("Event received", { type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const productIds = session.metadata?.sanity_product_ids;

      if (!productIds) {
        logStep("No product IDs in metadata, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const ids = productIds.split(",").filter(Boolean);
      logStep("Updating Sanity products", { ids });

      // Build Sanity mutations to set inStock = false
      const mutations = ids.map((id) => ({
        patch: {
          id,
          set: { inStock: false },
        },
      }));

      const sanityResponse = await fetch(
        `https://${sanityProjectId}.api.sanity.io/v2024-01-01/data/mutate/${sanityDataset}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sanityToken}`,
          },
          body: JSON.stringify({ mutations }),
        }
      );

      if (!sanityResponse.ok) {
        const errorText = await sanityResponse.text();
        logStep("Sanity mutation failed", { status: sanityResponse.status, error: errorText });
        throw new Error(`Sanity mutation failed: ${errorText}`);
      }

      const result = await sanityResponse.json();
      logStep("Sanity updated successfully", result);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
