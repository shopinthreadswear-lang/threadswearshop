import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { categories, categoryGroups } from "@/data/categories";
import { collections } from "@/data/collections";
import { articles } from "@/data/journal";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const s = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") => ({ url: absoluteUrl(path), lastModified: now, changeFrequency, priority });
  return [
    s("/", 1, "daily"),
    ...["/new-arrivals", "/shop", "/best-sellers", "/trending", "/sale", "/collections"].map((p) => s(p, 0.9, "daily")),
    ...[...categories.map((c) => c.slug), ...Object.keys(categoryGroups)].map((c) => s(`/men/${c}`, 0.8)),
    ...collections.map((c) => s(`/collections/${c.slug}`, 0.8)),
    ...products.map((p) => s(`/products/${p.slug}`, 0.7)),
    s("/journal", 0.6),
    ...articles.map((a) => s(`/journal/${a.slug}`, 0.5, "monthly")),
    ...["/about", "/our-story", "/gift-cards", "/stores", "/careers", "/contact", "/faq", "/shipping", "/returns", "/size-guide", "/track-order"].map((p) => s(p, 0.4, "monthly")),
    ...["/privacy", "/terms", "/cookies"].map((p) => s(p, 0.2, "yearly")),
  ];
}
