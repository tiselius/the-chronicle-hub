import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { sanityClient, articlesQuery, urlFor, Article } from "@/lib/sanity";
import { Skeleton } from "@/components/ui/skeleton";

const ArticleCard = ({ article }: { article: Article }) => {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group">
      <Link to={`/article/${article.slug.current}`} className="block hover:no-underline">
        {article.mainImage && (
          <div className="aspect-[16/10] overflow-hidden mb-4">
            <img
              src={urlFor(article.mainImage)}
              alt={article.mainImage.alt || article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="space-y-2">
          <time className="text-sm text-muted-foreground font-sans">
            {formattedDate}
          </time>
          <h2 className="text-2xl font-serif group-hover:underline">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>
          )}
          {article.author && (
            <p className="text-sm text-muted-foreground font-sans">
              By {article.author.name}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
};

const ArticleSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="aspect-[16/10] w-full" />
    <Skeleton className="h-4 w-24" />
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

// Mock data for development when Sanity isn't connected
const mockArticles: Article[] = [
  {
    _id: "1",
    _createdAt: "2024-01-15",
    title: "The Art of Mindful Design",
    slug: { current: "art-of-mindful-design" },
    excerpt: "Exploring how intentional design choices create more meaningful user experiences and lasting impressions.",
    publishedAt: "2024-01-15",
    author: { name: "Jane Mitchell" },
  },
  {
    _id: "2",
    _createdAt: "2024-01-10",
    title: "Embracing Simplicity in a Complex World",
    slug: { current: "embracing-simplicity" },
    excerpt: "Why stripping away the unnecessary leads to clarity, focus, and a more purposeful creative practice.",
    publishedAt: "2024-01-10",
    author: { name: "David Chen" },
  },
  {
    _id: "3",
    _createdAt: "2024-01-05",
    title: "The Future of Digital Craftsmanship",
    slug: { current: "future-digital-craftsmanship" },
    excerpt: "How traditional craft principles are finding new expression in the digital age.",
    publishedAt: "2024-01-05",
    author: { name: "Sarah Williams" },
  },
];

const Articles = () => {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      try {
        const result = await sanityClient.fetch<Article[]>(articlesQuery);
        return result.length > 0 ? result : mockArticles;
      } catch {
        // Return mock data if Sanity isn't configured
        return mockArticles;
      }
    },
  });

  return (
    <Layout>
      <section className="container-wide py-16">
        <header className="mb-16">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Articles</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Essays and thoughts on design, craft, and the art of making.
          </p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <ArticleSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <p className="text-muted-foreground">Unable to load articles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {articles?.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Articles;
