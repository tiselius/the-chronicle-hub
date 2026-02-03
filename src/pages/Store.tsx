import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { sanityClient, productsQuery, urlFor, Product } from "@/lib/sanity";
import { Skeleton } from "@/components/ui/skeleton";

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

// Mock data for development
const mockProducts: Product[] = [
  {
    _id: "1",
    _createdAt: "2024-01-15",
    name: "Minimal Desk Lamp",
    slug: { current: "minimal-desk-lamp" },
    price: 145,
    description: "A beautifully crafted desk lamp with clean lines and warm ambient lighting.",
    inStock: true,
  },
  {
    _id: "2",
    _createdAt: "2024-01-10",
    name: "Ceramic Vase",
    slug: { current: "ceramic-vase" },
    price: 78,
    description: "Handmade ceramic vase with a subtle matte finish.",
    inStock: true,
  },
  {
    _id: "3",
    _createdAt: "2024-01-05",
    name: "Leather Notebook",
    slug: { current: "leather-notebook" },
    price: 42,
    description: "Premium leather-bound notebook with archival quality paper.",
    inStock: true,
  },
  {
    _id: "4",
    _createdAt: "2024-01-01",
    name: "Wool Throw Blanket",
    slug: { current: "wool-throw-blanket" },
    price: 195,
    description: "Luxuriously soft merino wool throw in a timeless neutral tone.",
    inStock: false,
  },
];

const Store = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      try {
        const result = await sanityClient.fetch<Product[]>(productsQuery);
        return result.length > 0 ? result : mockProducts;
      } catch {
        return mockProducts;
      }
    },
  });

  return (
    <Layout>
      <section className="container-wide py-16">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Store</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Carefully curated objects for thoughtful living.
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
