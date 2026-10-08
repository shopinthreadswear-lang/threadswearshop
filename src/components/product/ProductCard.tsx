"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { getProductById, imagesFor } from "@/data/products";
import { useStore } from "@/components/providers/StoreProvider";
import { WishlistButton } from "./WishlistButton";
import { ColorSwatches } from "./ColorSwatches";
import { Price } from "@/components/ui/Price";
import { Plus, Check } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { flyToBag } from "@/lib/fly";

type CardProps = { priority?: boolean; sizes?: string; className?: string };

/** Server components pass `productId` (keeps the RSC payload small); client components may pass the product. */
export function ProductCard({ product, productId, ...rest }: CardProps & ({ product: Product; productId?: never } | { productId: string; product?: never })) {
  const p = product ?? getProductById(productId!);
  if (!p) return null;
  return <Card product={p} {...rest} />;
}

function Card({ product: p, priority = false, sizes = "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw", className }: CardProps & { product: Product }) {
  const [color, setColor] = useState(p.colors[0].name);
  const [quickOpen, setQuickOpen] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const { addToCart, toast } = useStore();
  const media = useRef<HTMLDivElement>(null);
  const imgs = imagesFor(p, color);
  const stockFor = (s: string) => p.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;
  const colorStock = p.sizes.reduce((a, s) => a + stockFor(s), 0);
  const soldOut = colorStock === 0;
  const lowStock = !soldOut && colorStock <= 5;
  const href = `/products/${p.slug}${color !== p.colors[0].name ? `?color=${encodeURIComponent(color)}` : ""}`;

  const quickAdd = (size: string) => {
    if (stockFor(size) <= 0) return;
    setAdded(size);
    // Throw the photo into the bag, then confirm — the drawer stays shut so browsing isn't interrupted.
    flyToBag(media.current, imgs[0]).then(() => {
      addToCart({ productId: p.id, color, size }, { silent: true });
      toast(`${p.name} · ${size} added to your bag`, { tone: "success", action: { label: "View bag", href: "/bag" } });
    });
    setTimeout(() => {
      setAdded(null);
      setQuickOpen(false);
    }, 900);
  };

  return (
    <article className={cn("group/card relative", className)} onMouseLeave={() => setQuickOpen(false)}>
      <div ref={media} className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-bone">
        <Link href={href} aria-label={p.name} className="absolute inset-0" data-cursor="View">
          <Image
            src={imgs[0]}
            alt={`${p.name} in ${color}`}
            fill
            sizes={sizes}
            priority={priority}
            className="img-grade object-cover transition-[transform,opacity] duration-[1200ms] ease-[var(--ease-lux)] group-hover/card:scale-[1.035]"
          />
          {imgs[1] && (
            <Image
              src={imgs[1]}
              alt=""
              aria-hidden
              fill
              sizes={sizes}
              className="img-grade object-cover opacity-0 transition-opacity duration-700 ease-[var(--ease-lux)] group-hover/card:opacity-100 max-md:hidden"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5 md:left-4 md:top-4">
          {p.badge && (
            <span className={cn("rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em]", p.badge === "Sale" ? "bg-error text-cream" : p.badge === "Limited Edition" ? "bg-burgundy text-cream" : p.badge === "New" ? "bg-ochre text-ink" : "bg-ivory text-burgundy")}>
              {p.badge}
            </span>
          )}
          {soldOut ? (
            <span className="rounded-full bg-ivory px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted">Sold Out</span>
          ) : lowStock ? (
            <span className="rounded-full bg-ivory px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-warning">Only {colorStock} left</span>
          ) : null}
        </div>

        <WishlistButton productId={p.id} name={p.name} className="absolute right-2 top-2 h-10 w-10 md:right-3 md:top-3" />

        {!soldOut && (
          <>
            {/* Mobile quick-add trigger */}
            <button
              type="button"
              onClick={() => setQuickOpen((o) => !o)}
              aria-label={`Quick add ${p.name}`}
              aria-expanded={quickOpen}
              className="absolute bottom-2 right-2 grid h-11 w-11 place-items-center rounded-full bg-ivory/95 md:hidden"
            >
              <Plus size={15} className={cn("transition-transform duration-300", quickOpen && "rotate-45")} />
            </button>
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 bg-ivory/95 backdrop-blur-[2px] transition-transform duration-500 ease-[var(--ease-lux)]",
                quickOpen ? "translate-y-0" : "translate-y-full md:group-hover/card:translate-y-0 md:group-focus-within/card:translate-y-0",
                "max-md:mr-14",
              )}
            >
              <div className="px-3 pb-3 pt-2.5 md:px-4 md:pb-4">
                <p className="mb-2 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-muted md:block">Quick Add</p>
                <div className="flex flex-wrap gap-1">
                  {p.sizes.map((s) => {
                    const out = stockFor(s) <= 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={out}
                        onClick={() => quickAdd(s)}
                        aria-label={`Add size ${s} to bag${out ? " (out of stock)" : ""}`}
                        className={cn(
                          "min-w-[2.4rem] flex-1 rounded-full border px-1.5 py-2.5 font-mono text-[11px] transition-colors duration-300",
                          added === s ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink hover:bg-ink hover:text-ivory",
                          out && "border-transparent text-faint line-through hover:bg-transparent hover:text-faint",
                        )}
                      >
                        {added === s ? <Check size={13} className="mx-auto" /> : s.replace("UK ", "")}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-serif text-[15.5px] leading-snug md:truncate md:text-[18px]">
            <Link href={href} className="link-u hit">
              {p.name}
            </Link>
          </h3>
          <Price price={p.price} compareAt={p.compareAtPrice} className="mt-1 font-mono text-[12.5px] text-charcoal" />
        </div>
      </div>
      {p.colors.length > 1 && (
        <div className="mt-3 flex items-center gap-2.5">
          <ColorSwatches colors={p.colors} value={color} onChange={setColor} />
          <span className="text-[11px] text-faint">{p.colors.length} colours</span>
        </div>
      )}
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <div className="skeleton aspect-[3/4] rounded-[18px]" />
      <div className="skeleton mt-4 h-3 w-3/4" />
      <div className="skeleton mt-2 h-3 w-1/3" />
    </div>
  );
}
