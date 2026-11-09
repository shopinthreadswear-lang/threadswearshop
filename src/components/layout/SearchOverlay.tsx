"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useStore } from "@/components/providers/StoreProvider";
import { searchProducts, trendingSearches, popularCategories } from "@/lib/search";
import { bestSellers } from "@/data/products";
import { ArrowRight, CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { Price } from "@/components/ui/Price";
import { track } from "@/lib/analytics";
import { useMounted } from "@/lib/useMounted";

const RECENT_KEY = "tw.recentSearches.v1";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useMounted();
  const deferred = useDeferredValue(q);
  const results = useMemo(() => searchProducts(deferred, 8), [deferred]);
  const suggestions = useMemo(() => {
    if (deferred.length < 2) return [];
    const d = deferred.toLowerCase();
    return trendingSearches.filter((s) => s.toLowerCase().includes(d)).slice(0, 4);
  }, [deferred]);

  useEffect(() => {
    if (!searchOpen) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read persisted recent searches when opening
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {}
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSearchOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [searchOpen, setSearchOpen]);

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {}
    track({ name: "search", search_term: t });
    setSearchOpen(false);
    setQ("");
    router.push(`/search?q=${encodeURIComponent(t)}`);
  };

  const close = () => {
    setSearchOpen(false);
  };

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          data-lenis-prevent
          className="fixed inset-0 z-[85] overflow-y-auto bg-ivory"
        >
          <motion.div initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="container-site pb-24 pt-6 md:pt-10">
            <div className="flex justify-end">
              <button type="button" onClick={close} className="flex items-center gap-2 p-2 label-sm hover:opacity-60" aria-label="Close search">
                <span className="hidden sm:inline">Close</span> <CloseIcon size={18} />
              </button>
            </div>
            <p className="eyebrow mt-6 text-muted md:mt-10">Search Threads Ware</p>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                go(q);
              }}
              className="mt-5 flex items-center gap-4 border-b border-ink pb-4"
            >
              <SearchIcon size={26} className="shrink-0" />
              <label htmlFor="site-search" className="sr-only">
                What are you looking for?
              </label>
              <input
                ref={inputRef}
                id="site-search"
                data-big
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What are you looking for?"
                autoComplete="off"
                enterKeyHint="search"
                className="w-full bg-transparent font-serif text-[clamp(1.8rem,4.5vw,3.6rem)] leading-none placeholder:text-ink/25 focus:outline-none"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} className="label-sm text-muted hover:text-ink">
                  Clear
                </button>
              )}
            </form>

            {!deferred.trim() ? (
              <div className="mt-12 grid gap-12 md:grid-cols-12">
                <div className="md:col-span-4 space-y-10">
                  {recent.length > 0 && (
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="eyebrow text-muted">Recent Searches</p>
                        <button
                          type="button"
                          className="text-[11px] text-muted underline underline-offset-4 hover:text-ink"
                          onClick={() => {
                            setRecent([]);
                            try {
                              localStorage.removeItem(RECENT_KEY);
                            } catch {}
                          }}
                        >
                          Clear
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {recent.map((r) => (
                          <li key={r}>
                            <button type="button" onClick={() => go(r)} className="text-[15px] link-u">
                              {r}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <p className="eyebrow mb-4 text-muted">Trending Searches</p>
                    <ul className="flex flex-wrap gap-2">
                      {trendingSearches.map((t) => (
                        <li key={t}>
                          <button type="button" onClick={() => go(t)} className="border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
                            {t}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow mb-4 text-muted">Popular Categories</p>
                    <ul className="grid grid-cols-2 gap-y-2">
                      {popularCategories.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} onClick={close} className="font-serif text-[22px] link-u">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="md:col-span-8">
                  <p className="eyebrow mb-5 text-muted">Most Wanted</p>
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {bestSellers().slice(0, 4).map((p) => (
                      <li key={p.id}>
                        <Link href={`/products/${p.slug}`} onClick={close} className="group block">
                          <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                            <Image src={p.images[0]} alt={p.name} fill sizes="(max-width:640px) 50vw, 20vw" className="img-grade object-cover transition-transform duration-1000 group-hover:scale-105" />
                          </div>
                          <p className="mt-3 text-[13px]">{p.name}</p>
                          <Price price={p.price} compareAt={p.compareAtPrice} className="text-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-10 grid gap-10 md:grid-cols-12">
                <div className="md:col-span-3">
                  <p className="eyebrow mb-4 text-muted">Suggestions</p>
                  <ul className="space-y-2">
                    {[deferred, ...suggestions.filter((s) => s.toLowerCase() !== deferred.toLowerCase())].map((s) => (
                      <li key={s}>
                        <button type="button" onClick={() => go(s)} className="text-left text-[15px] link-u">
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-9" aria-live="polite">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="eyebrow text-muted">{results.length ? `Products` : `No products for “${deferred}”`}</p>
                    {results.length > 0 && (
                      <button type="button" onClick={() => go(q)} className="flex items-center gap-2 label-sm link-u">
                        View all results <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                  {results.length ? (
                    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {results.map((p) => (
                        <li key={p.id}>
                          <Link href={`/products/${p.slug}`} onClick={close} className="group block">
                            <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                              <Image src={p.images[0]} alt={p.name} fill sizes="(max-width:640px) 50vw, 18vw" className="img-grade object-cover transition-transform duration-1000 group-hover:scale-105" />
                            </div>
                            <p className="mt-3 text-[13px] leading-snug">{p.name}</p>
                            <Price price={p.price} compareAt={p.compareAtPrice} className="text-muted" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-[14px] text-muted">
                      Try a different term, or explore{" "}
                      {popularCategories.slice(0, 3).map((c, i) => (
                        <span key={c.href}>
                          <Link href={c.href} onClick={close} className="link-static text-ink">
                            {c.label}
                          </Link>
                          {i < 2 ? ", " : "."}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
