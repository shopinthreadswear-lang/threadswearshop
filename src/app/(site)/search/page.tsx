import { Suspense } from "react";
import { SearchResults } from "./SearchResults";
import { ListingSkeleton } from "@/components/listing/ListingPage";
import type { Metadata } from "next";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = (await searchParams).q?.slice(0, 60);
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false, follow: true } };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ListingSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
