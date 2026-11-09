import type { Metadata } from "next";
import { absoluteUrl, site } from "./site";
import { IMG } from "@/data/images";

export function pageMeta({ title, description, path, image, noindex, type = "website" }: { title: string; description: string; path: string; image?: string; noindex?: boolean; type?: "website" | "article" }): Metadata {
  const url = absoluteUrl(path);
  const img = `${image ?? IMG.heroSuit}?w=1200&h=630&fit=crop&auto=format&q=75`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | Threads Ware`, description, url, siteName: site.shortName, type, locale: "en_IN", images: [{ url: img, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title: `${title} | Threads Ware`, description, images: [img], site: "@threadsware" },
    robots: noindex ? { index: false, follow: false } : undefined,
  };
}
