"use client";

import { applyCatalog, type CatalogState } from "@/lib/catalog";

/**
 * Brings the admin's catalogue edits (prices, offers, hidden pieces, new products, store settings) into the browser.
 * Rendered first in the root layout, so it runs before any component reads the catalogue.
 */
export function CatalogSync({ state }: { state: CatalogState | null }) {
  applyCatalog(state);
  return null;
}
