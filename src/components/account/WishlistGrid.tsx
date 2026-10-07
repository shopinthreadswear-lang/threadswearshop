"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import { getProductById, imagesFor } from "@/data/products";
import { Price } from "@/components/ui/Price";
import { CloseIcon, ArrowRight } from "@/components/ui/Icons";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/cn";

function WishlistItem({ p }: { p: Product }) {
  const { toggleWishlist, addToCart, toast } = useStore();
  const [color, setColor] = useState(p.colors[0].name);
  const [size, setSize] = useState<string>(p.sizes.length === 1 ? p.sizes[0] : "");
  const [err, setErr] = useState(false);
  const stockFor = (s: string) => p.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;

  const move = () => {
    if (!size) {
      setErr(true);
      return;
    }
    addToCart({ productId: p.id, color, size }, { silent: true });
    toggleWishlist(p.id);
    toast(`${p.name} moved to your bag`, { action: { label: "View Bag", href: "/bag" } });
  };

  return (
    <li className="group relative">
      <div className="relative aspect-[3/4] overflow-hidden bg-bone">
        <Link href={`/products/${p.slug}`} aria-label={p.name}>
          <Image src={imagesFor(p, color)[0]} alt={`${p.name} in ${color}`} fill sizes="(max-width:768px) 50vw, 25vw" className="img-grade object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
        </Link>
        <button type="button" onClick={() => toggleWishlist(p.id)} aria-label={`Remove ${p.name} from wishlist`} className="absolute right-2 top-2 grid h-9 w-9 place-items-center bg-ivory/85 transition-colors hover:bg-ivory">
          <CloseIcon size={14} />
        </button>
      </div>
      <Link href={`/products/${p.slug}`} className="mt-4 block text-[13.5px] link-u">
        {p.name}
      </Link>
      <Price price={p.price} compareAt={p.compareAtPrice} className="mt-1 text-charcoal" />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="sr-only" htmlFor={`wl-c-${p.id}`}>Colour</label>
        <select id={`wl-c-${p.id}`} value={color} onChange={(e) => setColor(e.target.value)} className="field h-10 px-3 text-[12.5px]">
          {p.colors.map((c) => (
            <option key={c.name}>{c.name}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`wl-s-${p.id}`}>Size</label>
        <select
          id={`wl-s-${p.id}`}
          value={size}
          onChange={(e) => {
            setSize(e.target.value);
            setErr(false);
          }}
          aria-invalid={err}
          className={cn("field h-10 px-3 text-[12.5px]", err && "border-error")}
        >
          <option value="">Size</option>
          {p.sizes.map((s) => (
            <option key={s} value={s} disabled={stockFor(s) <= 0}>
              {s}
              {stockFor(s) <= 0 ? " — sold out" : stockFor(s) <= 5 ? ` — ${stockFor(s)} left` : ""}
            </option>
          ))}
        </select>
      </div>
      {err && <p className="field-error">Select a size to continue.</p>}
      <button type="button" onClick={move} className="btn btn-outline btn-sm btn-block mt-2">
        Move to Bag
      </button>
    </li>
  );
}

export function WishlistGrid({ compact = false }: { compact?: boolean }) {
  const { wishlist, hydrated } = useStore();
  const items = wishlist.map(getProductById).filter(Boolean) as Product[];
  if (!hydrated)
    return (
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="skeleton aspect-[3/4]" />
        ))}
      </div>
    );
  if (!items.length)
    return (
      <div className={cn("border-y border-line text-center", compact ? "py-14" : "py-24")}>
        <p className="display-md">{compact ? "Save it for later." : "Your wishlist is waiting."}</p>
        <p className="mx-auto mt-4 max-w-sm text-[14px] text-muted">Tap the heart on any piece to keep it here — we’ll let you know if it’s running low.</p>
        <Link href="/collections" className="btn btn-primary mt-8">
          <span>Explore Collection</span> <ArrowRight className="btn-arrow" size={15} />
        </Link>
      </div>
    );
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-5", compact ? "md:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4")}>
      {items.map((p) => (
        <WishlistItem key={p.id} p={p} />
      ))}
    </ul>
  );
}
