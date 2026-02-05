import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { sanityClient, productsQuery, urlFor, Product } from "@/lib/sanity";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <article className="group">
      <Link to={`/store/${product.slug.current}`} className="block hover:no-underline">
        <div className="aspect-square overflow-hidden mb-4 bg-secondary">
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
        <div className="space-y-1">
          <h2 className="text-lg font-sans font-medium group-hover:underline">
            {product.name}
          </h2>
          <p className="text-muted-foreground font-sans">
            {formatPrice(product.price)}
          </p>
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {product.categories.map((category) => (
                <Badge key={category._id} variant="secondary" className="text-xs font-sans">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
          {product.inStock === false && (
            <p className="text-sm text-muted-foreground">Out of stock</p>
          )}
        </div>
      </Link>
    </article>
  );
};

const ProductSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-square w-full" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/4" />
  </div>
);


const Store = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
        const result = await sanityClient.fetch<Product[]>(productsQuery);
        if (result.length <= 0 )
            console.log("Couldnt fetch any products.")
        return result;
    },
  });

  return (
    <Layout>
      <section className="container-wide py-16">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Store</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Köp mina böcker!!!\n 
            Bra pris bra pris.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-muted-foreground">Unable to load products.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products?.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Store;
