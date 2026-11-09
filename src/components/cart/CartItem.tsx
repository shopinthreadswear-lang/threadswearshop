"use client";

import Image from "next/image";
import Link from "next/link";
import type { CartLine } from "@/lib/types";
import { resolveLine, useStore } from "@/components/providers/StoreProvider";
import { variantStock } from "@/data/products";
import { Price } from "@/components/ui/Price";
import { Minus, Plus } from "@/components/ui/Icons";
import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

export function CartItem({ line, compact = false, onNavigate }: { line: CartLine; compact?: boolean; onNavigate?: () => void }) {
  const { updateQty, removeLine, addToCart, toggleWishlist, isWishlisted, toast } = useStore();
  const r = resolveLine(line);
  if (!r) return null;
  const stock = r.product ? variantStock(r.product, line.color, line.size) : 99;
  const max = Math.min(10, stock);
  const soldOut = stock <= 0;

  const moveToWishlist = () => {
    if (!r.product) return;
    if (!isWishlisted(r.product.id)) toggleWishlist(r.product.id);
    removeLine(line.key);
    toast("Moved to your wishlist", { action: { label: "View", href: "/wishlist" } });
  };

  const remove = () => {
    const { productId, color, size, quantity, giftCard } = line;
    removeLine(line.key);
    toast(`Removed ${r.name}`, { duration: 6500, action: { label: "Undo", onClick: () => addToCart({ productId, color, size, quantity, giftCard }, { silent: true }) } });
  };

  return (
    <div className={cn("flex gap-4", compact ? "py-5" : "py-7")}>
      <Link href={r.href} onClick={onNavigate} className={cn("relative shrink-0 overflow-hidden bg-bone", compact ? "h-[132px] w-[100px]" : "h-[180px] w-[136px] md:h-[210px] md:w-[158px]")}>
        <Image src={r.image} alt={r.name} fill sizes="160px" className="img-grade object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={r.href} onClick={onNavigate} className="font-serif text-[14.5px] font-semibold leading-snug link-u">
              {r.name}
            </Link>
            <dl className="mt-1.5 space-y-0.5 text-[12.5px] text-muted">
              <div className="flex gap-1.5">
                <dt className="sr-only">Colour</dt>
                <dd>{r.colorLabel}</dd>
                <span aria-hidden>·</span>
                <dt className="sr-only">Size</dt>
                <dd>{r.sizeLabel}</dd>
              </div>
            </dl>
          </div>
          <div className="text-right text-[13.5px]">
            {line.quantity > 1 ? <span>{formatINR(r.price * line.quantity)}</span> : <Price price={r.price} compareAt={r.compareAtPrice} className="justify-end" />}
          </div>
        </div>

        {soldOut ? (
          <p className="mt-2 text-[12px] text-error">This item has just sold out.</p>
        ) : stock <= 5 ? (
          <p className="mt-2 text-[12px] text-warning">Only {stock} left</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
          <div className="flex h-11 items-center rounded-pill border border-line" role="group" aria-label={`Quantity for ${r.name}`}>
            <button type="button" className="grid h-full w-11 place-items-center rounded-l-pill transition-colors hover:bg-bone disabled:opacity-30 disabled:hover:bg-transparent" onClick={() => updateQty(line.key, line.quantity - 1)} disabled={line.quantity <= 1} aria-label="Decrease quantity">
              <Minus size={12} />
            </button>
            <span className="w-7 text-center text-[13px] tabular-nums" aria-live="polite">
              {line.quantity}
            </span>
            <button type="button" className="grid h-full w-11 place-items-center rounded-r-pill transition-colors hover:bg-bone disabled:opacity-30 disabled:hover:bg-transparent" onClick={() => updateQty(line.key, line.quantity + 1)} disabled={line.quantity >= max} aria-label="Increase quantity">
              <Plus size={12} />
            </button>
          </div>
          <div className="flex items-center gap-4 text-[11.5px] tracking-wide">
            {r.product && (
              <button type="button" onClick={moveToWishlist} className="text-muted link-static hover:text-ink">
                Move to Wishlist
              </button>
            )}
            <button type="button" onClick={remove} className="text-muted link-static hover:text-ink">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
