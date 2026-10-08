"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { megaMenu } from "@/data/navigation";
import { categories, categoryGroups, slugifyType } from "@/data/categories";
import { collections } from "@/data/collections";
import { IMG } from "@/data/images";
import { ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export type MenuKey = "shop" | "clothing" | "collections";

const GROUPS = ["Topwear", ...megaMenu.more.map((m) => m.title)];

function Campaign({ items }: { items: { title: string; href: string; image: string; eyebrow: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {items.map((c) => (
        <Link key={c.href} href={c.href} className="group/c block">
          <div className="relative aspect-[3/4] overflow-hidden bg-bone">
            <Image src={c.image} alt={c.title} fill sizes="240px" className="img-grade object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover/c:scale-105" />
          </div>
          <p className="eyebrow mt-3 text-[11px] text-muted">{c.eyebrow}</p>
          <p className="mt-1 font-serif text-[19px] leading-tight">{c.title}</p>
        </Link>
      ))}
    </div>
  );
}

function ColTitle({ children, href }: { children: React.ReactNode; href?: string }) {
  return href ? (
    <Link href={href} className="eyebrow mb-4 block text-[11px] text-ink hover:opacity-60">
      {children}
    </Link>
  ) : (
    <p className="eyebrow mb-4 text-[11px] text-ink">{children}</p>
  );
}

const linkCls = "block py-[5px] text-[13.5px] text-muted transition-colors duration-200 hover:text-ink";

export function MegaMenu({ which }: { which: MenuKey }) {
  const [group, setGroup] = useState("Topwear");

  if (which === "shop")
    return (
      <div className="container-site grid grid-cols-12 gap-10 py-12">
        <div className="col-span-2">
          <ColTitle>Shop by Edit</ColTitle>
          <ul>
            {megaMenu.edits.map(([l, h]) => (
              <li key={h}>
                <Link href={h} className={linkCls}>
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2">
          <ColTitle href="/shop">Shop by Category</ColTitle>
          <ul>
            {[["T-Shirts", "/men/t-shirts"], ["Shirts", "/men/shirts"], ["Polos", "/men/polos"], ["Sweatshirts & Hoodies", "/men/sweatshirts-hoodies"], ["Knitwear", "/men/knitwear"], ["Jackets", "/men/jackets"], ["Coats", "/men/coats"], ["Blazers & Suiting", "/men/blazers-suiting"], ["Designer Wear", "/men/designer-wear"], ["Occasionwear", "/men/occasionwear"]].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className={linkCls}>
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-3">
          <ColTitle>Featured</ColTitle>
          <ul className="space-y-1">
            {[["New Arrivals", "/new-arrivals"], ["Best Sellers", "/best-sellers"], ["Trending Now", "/trending"], ["Shop All", "/shop"], ["Sale", "/sale"], ["Gift Cards", "/gift-cards"]].map(([l, h]) => (
              <li key={h}>
                <Link href={h} className="group/f flex items-center justify-between border-b border-line py-3 font-serif text-[22px] leading-none">
                  {l}
                  <ArrowRight size={14} className="-translate-x-2 opacity-0 transition-all duration-500 group-hover/f:translate-x-0 group-hover/f:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-5">
          <Campaign items={megaMenu.campaign} />
        </div>
      </div>
    );

  if (which === "collections")
    return (
      <div className="container-site grid grid-cols-12 gap-10 py-12">
        <div className="col-span-4">
          <ColTitle href="/collections">All Collections</ColTitle>
          <ul className="grid grid-cols-2 gap-x-8">
            {collections.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className={linkCls}>
                  {c.name.replace(/^The /, "")}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-8 grid grid-cols-3 gap-4">
          {collections.slice(0, 3).map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group/c block">
              <div className="relative aspect-[4/5] overflow-hidden bg-bone">
                <Image src={c.image} alt={c.name} fill sizes="300px" className="img-grade object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover/c:scale-105" />
              </div>
              <p className="mt-3 font-serif text-[19px]">{c.name}</p>
              <p className="mt-1 text-[12.5px] text-muted">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </div>
    );

  // Clothing
  const more = megaMenu.more.find((m) => m.title === group);
  return (
    <div className="container-site grid grid-cols-12 gap-8 py-10">
      <div className="col-span-2 border-r border-line pr-6">
        <ColTitle href="/men/clothing">Clothing</ColTitle>
        <ul role="tablist" aria-orientation="vertical" aria-label="Clothing groups">
          {GROUPS.map((g) => (
            <li key={g}>
              <button
                type="button"
                role="tab"
                aria-selected={group === g}
                onMouseEnter={() => setGroup(g)}
                onFocus={() => setGroup(g)}
                onClick={() => setGroup(g)}
                className={cn("flex w-full items-center justify-between py-2 text-left font-serif text-[19px] leading-tight transition-colors", group === g ? "text-ink" : "text-faint hover:text-ink")}
              >
                {g}
                <span aria-hidden className={cn("h-px bg-ink transition-all duration-500", group === g ? "w-4" : "w-0")} />
              </button>
            </li>
          ))}
        </ul>
        <Link href="/men/clothing" className="mt-6 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] link-u">
          Shop All Clothing
        </Link>
      </div>

      <div role="tabpanel" className="col-span-7">
        {group === "Topwear" ? (
          <div className="grid grid-cols-4 gap-x-8 gap-y-8">
            {megaMenu.topwear.map((g) => (
              <div key={g.slug}>
                <ColTitle href={`/men/${g.slug}`}>{g.title}</ColTitle>
                <ul>
                  {g.types.map((t) => (
                    <li key={t}>
                      <Link href={`/men/${g.slug}?type=${slugifyType(t)}`} className={cn(linkCls, "py-[3px] text-[13px]")}>
                        {t}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : more ? (
          <div>
            <ColTitle href={`/men/${more.slug}`}>{more.title}</ColTitle>
            <ul className="grid grid-cols-3 gap-x-8">
              {more.items.map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className={linkCls}>
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-md text-[13px] leading-relaxed text-muted">{categories.find((c) => c.slug === more.slug)?.description ?? categoryGroups[more.slug]?.description}</p>
          </div>
        ) : null}
      </div>

      <div className="col-span-3 space-y-6">
        <div>
          <ColTitle>The Edits</ColTitle>
          <ul className="grid grid-cols-2 gap-x-4">
            {megaMenu.edits.map(([l, h]) => (
              <li key={h}>
                <Link href={h} className={cn(linkCls, "py-[3px] text-[13px]")}>
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/collections/new-season" className="group/c relative block aspect-[16/11] overflow-hidden bg-bone">
          <Image src={IMG.manBrownJacket} alt="New Season campaign" fill sizes="360px" className="img-grade object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover/c:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent" />
          <div className="absolute bottom-4 left-4 text-cream">
            <p className="eyebrow text-[11px] opacity-80">Autumn / Winter ’26</p>
            <p className="mt-1 font-serif text-[22px]">New Season</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
