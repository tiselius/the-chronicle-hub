import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();

  // Clear the cart after successful checkout
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <Layout>
      <div className="container-editorial py-16">
        <div className="text-center py-16 max-w-lg mx-auto">
          <CheckCircle className="w-20 h-20 mx-auto text-primary mb-6" />
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Tack för din beställning!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Din order har tagits emot och du kommer snart få en bekräftelse via e-post.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/store">
              <Button variant="outline">Fortsätt handla</Button>
            </Link>
            <Link to="/">
              <Button>Till startsidan</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
