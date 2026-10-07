"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { HERO_LOOKS } from "@/data/story";
import { getProduct } from "@/data/products";
import type { Product } from "@/lib/types";
import { ArrowLeft, ArrowRight } from "@/components/ui/Icons";
import { prefersReducedMotion } from "@/components/motion/useInView";
import { formatINR } from "@/lib/site";
import { cn } from "@/lib/cn";

const DURATION = 4500;
const LOOKS = HERO_LOOKS.map((l) => ({ ...l, products: l.pieces.map(getProduct).filter(Boolean) as Product[] }));

/** The campaign "film": six looks play in sequence, each captioned with what's worn. Opens from the hero's play badge. */
export function LookbookModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const go = useCallback((n: number) => setI((n + LOOKS.length) % LOOKS.length), []);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restart from the first look and respect motion settings
      setI(0);
      setAuto(!prefersReducedMotion());
    }
  }, [open]);
  useEffect(() => {
    if (!open || !auto) return;
    const t = setTimeout(() => go(i + 1), DURATION);
    return () => clearTimeout(t);
  }, [open, auto, i, go]);

  const look = LOOKS[i];
  return (
    <Modal open={open} onClose={onClose} title="The Lookbook — Autumn / Winter ’26" wide className="sm:max-w-5xl">
      <div className="-mx-6 -my-6 grid sm:-mx-8 sm:-my-8 md:grid-cols-5">
        <div className="relative aspect-[4/5] overflow-hidden bg-night md:col-span-3">
          {LOOKS.map((l, idx) => (
            <Image
              key={l.id}
              src={l.image}
              alt={idx === i ? `Model wearing ${l.products.map((p) => p.name).join(" and ")}` : ""}
              fill
              sizes="(max-width:768px) 100vw, 560px"
              className={cn("img-grade object-cover transition-[opacity,transform] ease-[var(--ease-in-out-lux)]", idx === i ? "scale-100 opacity-100 duration-[900ms]" : "scale-105 opacity-0 duration-700")}
              style={{ objectPosition: l.focus }}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 flex gap-1.5 p-4">
            {LOOKS.map((l, idx) => (
              <button key={l.id} type="button" onClick={() => { setAuto(false); go(idx); }} aria-label={`Look ${idx + 1}: ${l.category}`} aria-current={idx === i} className="h-6 flex-1">
                <span className="relative block h-[2px] bg-ivory/30">
                  <span className="absolute inset-y-0 left-0 bg-ivory" style={{ width: idx < i ? "100%" : idx === i ? (auto ? "100%" : "40%") : "0%", transition: idx === i && auto ? `width ${DURATION}ms linear` : "width 300ms" }} />
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col p-6 sm:p-8 md:col-span-2">
          <p className="eyebrow text-muted">
            Look {String(i + 1).padStart(2, "0")} · {look.category}
          </p>
          <ul key={look.id} className="mt-5 space-y-4" style={{ animation: "fade-up 500ms var(--ease-lux) both" }} aria-live="polite">
            {look.products.map((p) => (
              <li key={p.id}>
                <Link href={`/products/${p.slug}`} onClick={onClose} className="group block">
                  <span className="font-serif text-[24px] leading-tight group-hover:underline group-hover:underline-offset-4">{p.name}</span>
                  <span className="mt-1 block text-[13px] text-muted">
                    {formatINR(p.price)} · {p.materials}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12.5px] text-muted">
            {look.colour} · {look.products[0].modelInfo}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-8">
            <Link href={look.href} onClick={onClose} className="btn btn-primary btn-sm">
              <span>Shop {look.category}</span> <ArrowRight className="btn-arrow" size={13} />
            </Link>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setAuto(false); go(i - 1); }} aria-label="Previous look" className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-ink">
                <ArrowLeft />
              </button>
              <button type="button" onClick={() => { setAuto(false); go(i + 1); }} aria-label="Next look" className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-ink">
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
