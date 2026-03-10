import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useCart, CartItem } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft, ShoppingBag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK"
  }).format(price);
};
const CartItemRow = ({
  item
}: {
  item: CartItem;
}) => {
  const {
    removeFromCart
  } = useCart();
  return <div className="flex items-start gap-4 py-6 border-b border-border">
      {/* Product Image */}
      <div className="w-24 h-24 bg-secondary flex-shrink-0">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-sans font-medium">{item.name}</h3>
        <p className="text-muted-foreground mt-1">{formatPrice(item.price)}</p>

        {/* Remove Button */}
        <button onClick={() => removeFromCart(item.id)} className="mt-3 text-sm text-muted-foreground hover:text-destructive flex items-center gap-1">
          <Trash2 className="w-4 h-4" />
          Ta bort
        </button>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <p className="font-sans font-medium">
          {formatPrice(item.price)}
        </p>
      </div>
    </div>;
};
const Cart = () => {
  const {
    items,
    getTotalPrice,
    clearCart,
    removeFromCart
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { items }
      });

      // supabase.functions.invoke may return error in data.error or in error
      const errorMessage = data?.error || error?.message || "";

      if (errorMessage) {
        console.error("Checkout error:", errorMessage);

        // Check for out-of-stock errors
        if (errorMessage.includes("no longer in stock")) {
          const nameMatch = errorMessage.match(/"([^"]+)"/);
          const itemName = nameMatch?.[1];
          if (itemName) {
            const itemToRemove = items.find(i => i.name === itemName);
            if (itemToRemove) removeFromCart(itemToRemove.id);
          }
          toast({
            title: itemName ? `"${itemName}" är inte längre i lager` : "Produkten är slutsåld",
            description: "Produkten har tagits bort från din varukorg.",
            variant: "destructive",
          });
        } else if (errorMessage.includes("Price mismatch")) {
          toast({
            title: "Priset har ändrats",
            description: "Vänligen ladda om sidan och försök igen.",
            variant: "destructive",
          });
        } else if (errorMessage.includes("not found")) {
          toast({
            title: "Produkten hittades inte",
            description: "En produkt i din varukorg finns inte längre.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Något gick fel",
            description: "Kunde inte starta kassan. Försök igen.",
            variant: "destructive",
          });
        }
        setIsCheckingOut(false);
        return;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
        setIsCheckingOut(false);
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Något gick fel",
        description: "Kunde inte starta kassan. Försök igen.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };
  };
  if (items.length === 0) {
    return <Layout>
        <div className="container-editorial py-16">
          <h1 className="text-4xl md:text-5xl font-serif mb-8">Varukorg</h1>
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-6">Din varukorg är tom</p>
            <Link to="/store">
              <Button>Tillbaka till bokaffären</Button>
            </Link>
          </div>
        </div>
      </Layout>;
  }
  return <Layout>
      <div className="container-wide py-16">
        <Link to="/store" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          ​Tillbaka till bokaffären   
        </Link>

        <h1 className="text-4xl md:text-5xl font-serif mb-8">Varukorg</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="divide-y divide-border">
              {items.map(item => <CartItemRow key={item.id} item={item} />)}
            </div>
            <button onClick={clearCart} className="text-sm text-muted-foreground hover:text-foreground mt-4">
              Töm varukorgen
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary p-6 sticky top-24">
              <h2 className="font-sans font-medium text-lg mb-4">Ordersammanfattning</h2>
              
              <div className="space-y-2 text-sm border-b border-border pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delsumma</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frakt</span>
                  <span className="text-muted-foreground">Beräknas vid kassan</span>
                </div>
              </div>

              <div className="flex justify-between font-medium mb-6">
                <span>Total</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isCheckingOut}>
                {isCheckingOut ? <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Laddar...
                  </> : "Fortsätt till kassan"}
              </Button>
              {/* 
                  <p className="text-xs text-muted-foreground text-center mt-4">
                 Shipping and taxes calculated at checkout
               </p>
               */}
            </div>
          </div>
        </div>
      </div>
    </Layout>;
};
export default Cart;