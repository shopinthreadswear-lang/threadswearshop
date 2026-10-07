"use client";

import { Eyebrow } from "@/components/motion/Eyebrow";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getProduct } from "@/data/products";
import { IMG } from "@/data/images";
import { Price } from "@/components/ui/Price";
import { useStore } from "@/components/providers/StoreProvider";
import { ArrowRight } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

const SPOTS = [
  { slug: "mercer-heavyweight-tee", label: "T-Shirt", x: 50, y: 34 },
  { slug: "mayfair-suede-jacket", label: "Jacket", x: 36, y: 41 },
];

export function ShopTheLook() {
  const [active, setActive] = useState(1);
  const { addToCart } = useStore();
  const items = SPOTS.map((s) => ({ ...s, p: getProduct(s.slug)! }));
  const total = items.reduce((a, i) => a + i.p.price, 0);
  const cur = items[active];

  return (
    <section aria-labelledby="stl-title" className="section-y">
      <div className="container-site grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
        <Reveal variant="image" className="relative lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden bg-bone">
            <Image src={IMG.manSuedeStreet} alt="Model wearing the Mayfair Suede Jacket over the Mercer Heavyweight Tee" fill sizes="(max-width:1024px) 100vw, 50vw" className="img-grade object-cover object-[50%_40%]" />
            {items.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-label={`${s.label}: ${s.p.name}`}
                aria-pressed={active === i}
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                <span className={cn("absolute inset-0 rounded-full bg-ivory/60", active !== i && "animate-ping")} style={{ animationDuration: "2.4s" }} />
                <span className={cn("relative grid h-7 w-7 place-items-center rounded-full border border-ivory text-[13px] backdrop-blur-sm transition-colors duration-300", active === i ? "bg-ivory text-ink" : "bg-night/30 text-ivory")}>+</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow className="mb-4">Shop the Look</Eyebrow>
            <h2 id="stl-title" className="display-lg">Suede over heavyweight cotton.</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">The Mayfair in tobacco goat suede, layered over the 240 GSM Mercer Tee. Two pieces, one considered uniform. Tap a piece to explore it.</p>
          </Reveal>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {items.map((s, i) => (
              <li key={s.slug}>
                <button type="button" onClick={() => setActive(i)} aria-pressed={active === i} className="group flex w-full items-center gap-5 py-4 text-left">
                  <span className={cn("w-6 text-[11px] tabular-nums transition-colors", active === i ? "text-ink" : "text-faint")}>0{i + 1}</span>
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-bone">
                    <Image src={s.p.images[0]} alt="" fill sizes="48px" className="img-grade object-cover" />
                  </span>
                  <span className="flex-1">
                    <span className={cn("block text-[14px] transition-colors", active === i ? "text-ink" : "text-muted group-hover:text-ink")}>{s.p.name}</span>
                    <span className="eyebrow text-[10.5px] text-faint">{s.label}</span>
                  </span>
                  <Price price={s.p.price} className="text-charcoal" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={`/products/${cur.p.slug}`} className="btn btn-primary">
              <span>View {cur.label}</span> <ArrowRight className="btn-arrow" size={15} />
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                for (const i of items) {
                  const size = i.p.sizes.find((s) => (i.p.variants.find((v) => v.color === i.p.colors[0].name && v.size === s)?.stock ?? 0) > 0 && s === "M") ?? i.p.sizes.find((s) => (i.p.variants.find((v) => v.color === i.p.colors[0].name && v.size === s)?.stock ?? 0) > 0);
                  if (size) addToCart({ productId: i.p.id, color: i.p.colors[0].name, size }, { silent: i !== items[items.length - 1] });
                }
              }}
            >
              Add Complete Look · ₹{total.toLocaleString("en-IN")}
            </button>
          </div>
          <p className="mt-3 text-[12px] text-faint">Adds both pieces in size M — adjust sizes in your bag.</p>
        </div>
      </div>
    </section>
  );
}
