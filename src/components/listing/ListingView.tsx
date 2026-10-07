"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { getProductById } from "@/data/products";
import { applyFilters, colorHex, FACET_LABELS, facetOptions, labelFor, sortProducts, SORTS, type FacetKey, type Filters, type SortId } from "@/lib/filters";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Drawer } from "@/components/ui/Modal";
import { AccordionItem } from "@/components/ui/Accordion";
import { ChevronDown, CloseIcon, Filter, Grid, Check } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/useMediaQuery";

const PAGE = 12;
const DEFAULT_FACETS: FacetKey[] = ["type", "size", "color", "fit", "price", "material", "sleeve", "pattern", "occasion", "collection", "discount", "availability"];

function SortDropdown({ value, onChange }: { value: SortId; onChange: (s: SortId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const current = SORTS.find((s) => s.id === value)!;
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
        <span className="hidden text-muted sm:inline">Sort:</span> {current.label}
        <ChevronDown className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Sort products"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden border border-line bg-ivory py-2"
          >
            {SORTS.map((s) => (
              <li key={s.id} role="option" aria-selected={s.id === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] hover:bg-bone"
                >
                  {s.label}
                  {s.id === value && <Check size={13} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ListingView({ ids, listName, facets = DEFAULT_FACETS, defaultSort = "featured" }: { ids: string[]; listName: string; facets?: FacetKey[]; defaultSort?: SortId }) {
  const products = useMemo(() => ids.map(getProductById).filter(Boolean) as Product[], [ids]);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [drawer, setDrawer] = useState(false);
  const [cols, setCols] = useState<2 | 3 | 4>(4);
  const [count, setCount] = useState(PAGE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    try {
      const c = Number(localStorage.getItem("tw.gridCols"));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore viewer preference
      if (c === 2 || c === 3 || c === 4) setCols(c);
    } catch {}
  }, []);

  const filters: Filters = useMemo(() => {
    const f: Filters = {};
    for (const k of facets) {
      const v = params.getAll(k);
      if (v.length) f[k] = v;
    }
    return f;
  }, [params, facets]);
  const sort = (params.get("sort") as SortId) || defaultSort;

  const filtered = useMemo(() => applyFilters(products, filters), [products, filters]);
  // If a menu link points to a product type we don't stock yet, fall back gracefully.
  const typeFallback = !!filters.type?.length && filtered.length === 0 && Object.keys(filters).length === 1;
  const visibleSet = useMemo(() => sortProducts(typeFallback ? products : filtered, sort), [typeFallback, products, filtered, sort]);
  const visible = visibleSet.slice(0, count);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset pagination when the result set changes
    setCount(PAGE);
  }, [params]);

  useEffect(() => {
    track({ name: "view_item_list", list: listName, items: visibleSet.slice(0, 12).map((p) => ({ item_id: p.id, item_name: p.name, price: p.price })) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName]);

  const loadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setCount((c) => c + PAGE);
      setLoadingMore(false);
    }, 380);
  };

  // Tasteful infinite loading once the visitor has opted into "load more" behaviour by scrolling to the end.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || count >= visibleSet.length || count < PAGE * 2) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && loadMore(), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, visibleSet.length]);

  const update = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mut(next);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const toggle = (k: FacetKey, v: string) =>
    update((p) => {
      const cur = p.getAll(k);
      p.delete(k);
      (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).forEach((x) => p.append(k, x));
    });

  const clearAll = () =>
    update((p) => {
      for (const k of facets) p.delete(k);
    });

  const setGrid = (c: 2 | 3 | 4) => {
    setCols(c);
    try {
      localStorage.setItem("tw.gridCols", String(c));
    } catch {}
  };

  const activeChips = (Object.keys(filters) as FacetKey[]).flatMap((k) => (filters[k] ?? []).map((v) => ({ k, v })));
  const activeCount = activeChips.length;

  const facetPanel = (
    <div className="px-6 pb-6">
      {facets.map((k) => {
        const opts = facetOptions(products, filters, k);
        if (opts.length < 2 && !filters[k]?.length && k !== "availability") return null;
        const sel = filters[k] ?? [];
        return (
          <AccordionItem key={k} title={`${FACET_LABELS[k]}${sel.length ? ` (${sel.length})` : ""}`} defaultOpen={["type", "size", "color"].includes(k) || sel.length > 0}>
            {k === "size" ? (
              <div className="grid grid-cols-4 gap-2">
                {opts.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={sel.includes(o.value)}
                    disabled={!o.count && !sel.includes(o.value)}
                    onClick={() => toggle(k, o.value)}
                    className={cn("h-10 border text-[12px] transition-colors disabled:opacity-30", sel.includes(o.value) ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink")}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ) : k === "color" ? (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                {opts.map((o) => (
                  <li key={o.value}>
                    <button type="button" aria-pressed={sel.includes(o.value)} disabled={!o.count && !sel.includes(o.value)} onClick={() => toggle(k, o.value)} className="flex items-center gap-3 text-left text-[13px] disabled:opacity-35">
                      <span className={cn("h-5 w-5 shrink-0 rounded-full transition-shadow", sel.includes(o.value) ? "shadow-[0_0_0_2px_var(--color-ivory),0_0_0_3px_var(--color-ink)]" : "shadow-[0_0_0_1px_rgba(0,0,0,0.12)]")} style={{ background: colorHex(products, o.value) }} />
                      <span className="truncate">{o.label}</span>
                      <span className="text-faint">{o.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2.5">
                {opts.map((o) => (
                  <li key={o.value}>
                    <label className={cn("flex cursor-pointer items-center gap-3 text-[13.5px]", !o.count && !sel.includes(o.value) && "opacity-40")}>
                      <input type="checkbox" className="check" checked={sel.includes(o.value)} disabled={!o.count && !sel.includes(o.value)} onChange={() => toggle(k, o.value)} />
                      <span className="flex-1">{o.label}</span>
                      <span className="text-[12px] text-faint">{o.count}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </AccordionItem>
        );
      })}
    </div>
  );

  return (
    <div>
      {/* Sticky toolbar */}
      <div className="sticky top-[60px] z-20 border-b border-line bg-ivory/[0.96] backdrop-blur-md">
        <div className="container-site flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button type="button" onClick={() => setDrawer(true)} className="flex items-center gap-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]" aria-haspopup="dialog">
              <Filter /> Filters {activeCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] text-ivory">{activeCount}</span>}
            </button>
            <p className="hidden text-[12.5px] text-muted sm:block" aria-live="polite">
              {visibleSet.length} {visibleSet.length === 1 ? "piece" : "pieces"}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden items-center gap-1 md:flex" role="group" aria-label="Grid layout">
              {([2, 3, 4] as const).map((c) => (
                <button key={c} type="button" aria-pressed={cols === c} aria-label={`${c} columns`} onClick={() => setGrid(c)} className={cn("p-1.5 transition-opacity", cols === c ? "opacity-100" : "opacity-30 hover:opacity-70")}>
                  <Grid cols={c} />
                </button>
              ))}
            </div>
            <SortDropdown value={sort} onChange={(s) => update((p) => (s === defaultSort ? p.delete("sort") : p.set("sort", s)))} />
          </div>
        </div>
      </div>

      <div className="container-site pb-24 pt-8">
        {activeChips.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {activeChips.map(({ k, v }) => (
              <button key={k + v} type="button" onClick={() => toggle(k, v)} className="flex items-center gap-2 border border-line px-3 py-1.5 text-[12px] transition-colors hover:border-ink" aria-label={`Remove filter ${labelFor(k, v)}`}>
                {labelFor(k, v)} <CloseIcon size={11} />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="ml-2 text-[12px] text-muted link-static hover:text-ink">
              Clear all
            </button>
          </div>
        )}

        {typeFallback && (
          <div className="mb-10 border-l-2 border-champagne bg-paper px-5 py-4 text-[13.5px] text-charcoal">
            The <strong className="font-semibold">{labelFor("type", filters.type![0])}</strong> edit arrives later this season. In the meantime, explore the full range below.
          </div>
        )}

        {visibleSet.length === 0 ? (
          <div className="py-24 text-center">
            <p className="display-sm">Nothing matches those filters — yet.</p>
            <p className="mt-3 text-[14px] text-muted">Try removing a filter or two to see more pieces.</p>
            <button type="button" onClick={clearAll} className="btn btn-outline mt-8">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14", cols === 2 && "md:grid-cols-2", cols === 3 && "md:grid-cols-3", cols === 4 && "md:grid-cols-3 xl:grid-cols-4")}>
              {visible.map((p, i) => (
                <li key={p.id} className="page-enter">
                  <ProductCard product={p} priority={i < 4} sizes={cols === 2 ? "50vw" : cols === 3 ? "(max-width:768px) 50vw, 33vw" : "(max-width:768px) 50vw, (max-width:1280px) 33vw, 25vw"} />
                </li>
              ))}
              {loadingMore && Array.from({ length: cols }, (_, i) => <li key={`sk${i}`}><ProductCardSkeleton /></li>)}
            </ul>
            <div ref={sentinel} />
            {count < visibleSet.length && (
              <div className="mt-16 flex flex-col items-center gap-4">
                <p className="text-[12.5px] text-muted">
                  Showing {Math.min(count, visibleSet.length)} of {visibleSet.length}
                </p>
                <div className="h-px w-48 bg-line">
                  <div className="h-px bg-ink transition-[width] duration-500" style={{ width: `${(Math.min(count, visibleSet.length) / visibleSet.length) * 100}%` }} />
                </div>
                <button type="button" onClick={loadMore} disabled={loadingMore} className="btn btn-outline mt-2">
                  {loadingMore ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        side={isMobile ? "bottom" : "left"}
        title={`Filters${activeCount ? ` (${activeCount})` : ""}`}
        className={isMobile ? "h-[85dvh]" : undefined}
        footer={
          <div className="flex gap-3 px-6 py-4">
            <button type="button" onClick={clearAll} className="btn btn-outline flex-1" disabled={!activeCount}>
              Clear
            </button>
            <button type="button" onClick={() => setDrawer(false)} className="btn btn-primary flex-[2]">
              Show {visibleSet.length} {visibleSet.length === 1 ? "Piece" : "Pieces"}
            </button>
          </div>
        }
      >
        {facetPanel}
      </Drawer>
    </div>
  );
}
