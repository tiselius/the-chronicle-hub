import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import Layout from "@/components/layout/Layout";
import { sanityClient, articleBySlugQuery, urlFor, Article } from "@/lib/sanity";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["article", slug],
    queryFn: async () => {
        const result = await sanityClient.fetch<Article>(articleBySlugQuery, { slug });
        return result ;
    },
  });

  const formattedDate = article
    ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  if (isLoading) {
    return (
      <Layout>
        <article className="container-editorial py-16">
          <Skeleton className="h-4 w-24 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-48 mb-12" />
          <Skeleton className="aspect-[16/9] w-full mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="container-editorial py-16">
          <p className="text-muted-foreground">Article not found.</p>
          <Link to="/" className="text-foreground underline mt-4 inline-block">
            ← Back to articles
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="py-16">
        <header className="container-editorial mb-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to articles
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            {article.author && (
              <span className="font-sans">By {article.author.name}</span>
            )}
            <span>·</span>
            <time className="font-sans">{formattedDate}</time>
          </div>
        </header>

        {article.mainImage && (
          <div className="container-wide mb-12">
            <img
              src={urlFor(article.mainImage)}
              alt={article.mainImage.alt || article.title}
              className="w-full h-auto"
            />
          </div>
        )}

        <div className="container-editorial prose">
          {article.body && <PortableText value={article.body as any} />}
        </div>
      </article>
    </Layout>
  );
};

export default ArticleDetail;
