import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CartItem {
  id: string; // Sanity product _id
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutRequest {
  items: CartItem[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const { items }: CheckoutRequest = await req.json();

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    // Validate stock and prices against Sanity (source of truth)
    const sanityProjectId = "sx36dzit";
    const sanityDataset = "production";
    const productIds = items.map((item) => item.id);
    const query = encodeURIComponent(
      `*[_type == "product" && _id in $ids]{ _id, name, price, inStock }`
    );
    const params = encodeURIComponent(JSON.stringify({ ids: productIds }));
    const sanityUrl = `https://${sanityProjectId}.api.sanity.io/v2024-01-01/data/query/${sanityDataset}?query=${query}&$ids=${params}`;

    const sanityResponse = await fetch(sanityUrl);
    if (!sanityResponse.ok) {
      throw new Error("Failed to validate products against inventory");
    }

    const sanityData = await sanityResponse.json();
    const sanityProducts: Record<string, { name: string; price: number; inStock: boolean }> = {};
    for (const p of sanityData.result || []) {
      sanityProducts[p._id] = p;
    }

    // Check each item exists, is in stock, and price matches
    for (const item of items) {
      const sanityProduct = sanityProducts[item.id];
      if (!sanityProduct) {
        throw new Error(`Product "${item.name}" not found`);
      }
      if (sanityProduct.inStock === false) {
        throw new Error(`"${sanityProduct.name}" is no longer in stock`);
      }
      if (sanityProduct.price !== item.price) {
        throw new Error(
          `Price mismatch for "${sanityProduct.name}". Please refresh the page and try again.`
        );
      }
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Build line items using validated Sanity prices
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "sek",
        product_data: {
          name: sanityProducts[item.id].name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(sanityProducts[item.id].price * 100),
      },
      quantity: item.quantity,
    }));

    const origin = req.headers.get("origin") || "http://localhost:8080";

    // Store Sanity product IDs in metadata for webhook to update stock
    const metaProductIds = productIds.join(",");

    // Create checkout session for one-time payment (physical products)
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      shipping_address_collection: {
        allowed_countries: ["SE", "NO", "DK", "FI"], // Nordic countries
      },
      billing_address_collection: "required",
      metadata: {
        sanity_product_ids: productIds,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Checkout error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
