import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { sanityClient, productsQuery, productsByCategoryQuery, categoryBySlugQuery, urlFor, Product, Category } from "@/lib/sanity";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";

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
          {product.images && product.images.length > 0 ? (
            <img
              src={urlFor(product.images[0])}
              alt={product.images[0].alt || product.name}
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
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category");

  const { data: category } = useQuery({
    queryKey: ["category", categorySlug],
    queryFn: async () => {
      if (!categorySlug) return null;
      const result = await sanityClient.fetch<Category & { description?: string }>(categoryBySlugQuery, { slug: categorySlug });
      return result;
    },
    enabled: !!categorySlug,
  });

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", categorySlug],
    queryFn: async () => {
      if (categorySlug) {
        const result = await sanityClient.fetch<Product[]>(productsByCategoryQuery, { categorySlug });
        return result;
      }
      const result = await sanityClient.fetch<Product[]>(productsQuery);
      if (result.length <= 0)
        console.log("Couldnt fetch any products.");
      return result;
    },
  });

  return (
    <Layout>
      <section className="container-wide py-16">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-5xl md:text-6xl font-serif">
              {category ? category.title : "Store"}
            </h1>
            {category && (
              <Link
                to="/store"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
                Rensa filter
              </Link>
            )}
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {category?.description || "Köp mina böcker!!!\nBra pris bra pris."}
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
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Inga produkter i denna kategori.</p>
        )}
      </section>
    </Layout>
  );
};

export default Store;
