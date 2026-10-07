import Link from "next/link";
import { JsonLd } from "./JsonLd";
import { absoluteUrl } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Breadcrumb({ items, className, light = false }: { items: { label: string; href?: string }[]; className?: string; light?: boolean }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-[11.5px] tracking-[0.08em]", light ? "text-ivory/75" : "text-muted", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="opacity-50">/</span>}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="link-u inline-block py-2 hover:text-current">
                  {c.label}
                </Link>
              ) : (
                <span aria-current={i === all.length - 1 ? "page" : undefined} className={light ? "text-ivory" : "text-ink"}>
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.href ? absoluteUrl(c.href) : undefined })),
        }}
      />
    </>
  );
}
