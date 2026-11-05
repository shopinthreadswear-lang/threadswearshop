"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { searchProducts, trendingSearches, popularCategories } from "@/lib/search";
import { ListingView } from "@/components/listing/ListingView";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SearchIcon } from "@/components/ui/Icons";
import { bestSellers } from "@/data/products";
import { track } from "@/lib/analytics";

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q")?.trim() ?? "";
  const [input, setInput] = useState(q);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- keep the field in sync with the URL
  useEffect(() => setInput(q), [q]);
  const results = useMemo(() => searchProducts(q), [q]);
  useEffect(() => {
    if (q) track({ name: "search", search_term: q });
  }, [q]);

  return (
    <>
      <section className="container-site pb-10 pt-10 md:pt-16">
        <Breadcrumb items={[{ label: "Search" }]} className="mb-8" />
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) router.push(`/search?q=${encodeURIComponent(input.trim())}`);
          }}
          className="flex max-w-3xl items-center gap-4 border-b border-ink pb-3"
        >
          <SearchIcon size={22} />
          <label htmlFor="search-page" className="sr-only">
            Search
          </label>
          <input id="search-page" data-big value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search Threads Wear" className="w-full bg-transparent font-serif text-[clamp(1.8rem,3.4vw,3rem)] leading-none placeholder:text-ink/25 focus:outline-none" />
        </form>
        {q && (
          <p className="mt-6 text-[14px] text-muted" aria-live="polite">
            {results.length ? (
              <>
                {results.length} {results.length === 1 ? "result" : "results"} for <span className="text-ink">“{q}”</span>
              </>
            ) : null}
          </p>
        )}
      </section>

      {q && results.length > 0 ? (
        <ListingView key={q} ids={results.map((p) => p.id)} listName={`Search: ${q}`} facets={["category", "type", "size", "color", "price", "availability"]} />
      ) : (
        <section className="container-site pb-24">
          {q && (
            <div className="border-y border-line py-14 text-center">
              <h1 className="display-md">No results for “{q}”</h1>
              <p className="mt-3 text-[14px] text-muted">Check the spelling, try a broader term, or explore the suggestions below.</p>
            </div>
          )}
          <div className="grid gap-12 py-14 md:grid-cols-2">
            <div>
              <p className="eyebrow mb-5 text-muted">Suggested Searches</p>
              <ul className="flex flex-wrap gap-2">
                {trendingSearches.map((t) => (
                  <li key={t}>
                    <Link href={`/search?q=${encodeURIComponent(t)}`} className="block border border-line px-4 py-2 text-[13px] transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-5 text-muted">Popular Categories</p>
              <ul className="grid grid-cols-2 gap-y-2">
                {popularCategories.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} className="font-serif text-[24px] link-u">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="eyebrow mb-8 text-muted">Best Sellers</p>
          <ProductGrid products={bestSellers().slice(0, 8)} />
        </section>
      )}
    </>
  );
}
