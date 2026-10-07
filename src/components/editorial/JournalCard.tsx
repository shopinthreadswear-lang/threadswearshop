import Image from "next/image";
import Link from "next/link";
import type { JournalArticle } from "@/lib/types";
import { cn } from "@/lib/cn";

export function JournalCard({ article: a, large = false, className }: { article: JournalArticle; large?: boolean; className?: string }) {
  return (
    <article className={cn("group", className)}>
      <Link href={`/journal/${a.slug}`} className="block">
        <div className={cn("relative overflow-hidden bg-bone", large ? "aspect-[4/5] md:aspect-[5/6]" : "aspect-[4/5]")}>
          <Image src={a.image} alt={a.title} fill sizes={large ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 100vw, 33vw"} className="img-grade object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.04]" />
        </div>
        <p className="eyebrow mt-5 text-[10px] text-muted">
          {a.category} <span className="mx-2 opacity-50">·</span> {a.readTime}
        </p>
        <h3 className={cn("mt-2 font-serif leading-[1.1]", large ? "text-[clamp(1.8rem,3vw,2.6rem)]" : "text-[26px]")}>
          <span className="link-u">{a.title}</span>
        </h3>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted">{a.excerpt}</p>
      </Link>
    </article>
  );
}
