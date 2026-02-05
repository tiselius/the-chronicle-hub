import { createClient } from "@sanity/client";

// Create the Sanity client
// You'll need to replace these with your actual Sanity project details
export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID ,
  dataset: import.meta.env.VITE_SANITY_DATASET ,
  apiVersion: "2026-02-03",
  useCdn: false,
});

// Helper function to build image URLs
export const urlFor = (source: SanityImageSource) => {
  const projectId = import.meta.env.VITE_SANITY_PROJECT_ID; 
  const dataset = import.meta.env.VITE_SANITY_DATASET; 
  
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

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

export interface Article {
  _id: string;
  _createdAt: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: SanityImageSource;
  author?: string;
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
  categories?: Category[];
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
  author,
  publishedAt
}`;

export const articleBySlugQuery = `*[_type == "article" && slug.current == $slug][0] {
  _id,
  _createdAt,
  title,
  slug,
  excerpt,
  mainImage,
  author,
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
  images,
  "categories": categories[]->{ _id, title, slug },
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
  "categories": categories[]->{ _id, title, slug },
  inStock
}`;
