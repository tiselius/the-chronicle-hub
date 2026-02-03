import { createClient } from "@sanity/client";

// Create the Sanity client
// You'll need to replace these with your actual Sanity project details
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || "your-project-id",
  dataset: import.meta.env.VITE_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

// Helper function to build image URLs
export const urlFor = (source: SanityImageSource) => {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || "your-project-id";
  const dataset = import.meta.env.VITE_SANITY_DATASET || "production";
  
  if (!source?.asset?._ref) return "";
  
  const ref = source.asset._ref;
  const [, id, dimensions, format] = ref.split("-");
  
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;
};

// Types
export interface SanityImageSource {
  asset?: {
    _ref: string;
    _type: string;
  };
  alt?: string;
}

export interface Article {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: SanityImageSource;
  author?: {
    name: string;
    image?: SanityImageSource;
  };
  publishedAt: string;
  body?: unknown[];
}

export interface Product {
  _id: string;
  _createdAt: string;
  name: string;
  slug: { current: string };
  price: number;
  description?: string;
  mainImage?: SanityImageSource;
  images?: SanityImageSource[];
  inStock?: boolean;
}

// Queries
export const articlesQuery = `*[_type == "article"] | order(publishedAt desc) {
  _id,
  _createdAt,
  title,
  slug,
  excerpt,
  mainImage,
  author->{
    name,
    image
  },
  publishedAt
}`;

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  slug,
  excerpt,
  mainImage,
  author->{
    name,
    image
  },
  publishedAt,
  body
}`;

export const productsQuery = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  _createdAt,
  name,
  slug,
  price,
  description,
  mainImage,
  inStock
}`;

export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  _createdAt,
  name,
  slug,
  price,
  description,
  mainImage,
  images,
  inStock
}`;
