import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { sanityClient, productBySlugQuery, urlFor, Product } from "@/lib/sanity";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

// Mock product for development
const mockProduct: Product = {
  _id: "1",
  _createdAt: "2024-01-15",
  name: "Minimal Desk Lamp",
  slug: { current: "minimal-desk-lamp" },
  price: 145,
  description: "A beautifully crafted desk lamp with clean lines and warm ambient lighting. Made from solid brass with a brushed finish, this lamp brings both function and elegance to any workspace. The adjustable arm allows for precise positioning, while the weighted base ensures stability.",
  inStock: true,
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        const result = await sanityClient.fetch<Product>(productBySlugQuery, { slug });
        return result || mockProduct;
      } catch {
        return mockProduct;
      }
    },
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.mainImage ? urlFor(product.mainImage) : undefined,
        quantity: 1,
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide py-16">
          <Skeleton className="h-4 w-24 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-48" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-wide py-16">
          <p className="text-muted-foreground">Product not found.</p>
          <Link to="/store" className="text-foreground underline mt-4 inline-block">
            ← Back to store
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-wide py-16">
        <Link 
          to="/store" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-secondary">
            {product.mainImage ? (
              <img
                src={urlFor(product.mainImage)}
                alt={product.mainImage.alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif mb-2">{product.name}</h1>
              <p className="text-2xl text-foreground font-sans">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="pt-4">
              {product.inStock === false ? (
                <Button disabled variant="secondary" className="w-full md:w-auto">
                  Out of Stock
                </Button>
              ) : (
                <Button 
                  onClick={handleAddToCart}
                  className="w-full md:w-auto"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
