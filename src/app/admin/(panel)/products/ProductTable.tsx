"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { bulkProducts, importCSV } from "@/app/admin/actions";
import { ActionForm, Submit } from "@/components/admin/forms";
import { Pill } from "@/components/admin/bits";

export type Row = { id: string; name: string; sku: string; subcategory: string; image: string; price: string; compare?: string; discount?: number; hidden: boolean; custom: boolean; total: number; low: number; out: number };

const OPS = [
  { v: "hide", l: "Hide from shop" },
  { v: "show", l: "Show in shop" },
  { v: "sale", l: "Put on sale (% off)…", needs: "Percent off, e.g. 20" },
  { v: "unsale", l: "Take off sale" },
  { v: "price_pct", l: "Change price by %…", needs: "e.g. 10 or -10" },
  { v: "new_on", l: "Mark as new arrival" },
  { v: "new_off", l: "Remove new arrival" },
  { v: "best_on", l: "Mark as best seller" },
  { v: "best_off", l: "Remove best seller" },
];

export function ProductTable({ rows }: { rows: Row[] }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [op, setOp] = useState("");
  const all = rows.length > 0 && picked.length === rows.length;
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const needs = OPS.find((o) => o.v === op)?.needs;

  return (
    <ActionForm action={bulkProducts}>
      {picked.map((id) => <input key={id} type="hidden" name="ids" value={id} />)}
      <div className="sticky top-16 z-20 -mx-1 mb-3 flex flex-wrap items-center gap-2 rounded-chip border border-line bg-paper/95 px-3 py-2.5 shadow-card backdrop-blur-sm">
        <label className="flex h-9 cursor-pointer items-center gap-2 pr-2 text-[13px] font-semibold">
          <input type="checkbox" className="check" checked={all} onChange={() => setPicked(all ? [] : rows.map((r) => r.id))} aria-label="Select all products shown" />
          {picked.length ? `${picked.length} selected` : "Select all"}
        </label>
        <label htmlFor="bulk-op" className="sr-only">Bulk action</label>
        <select id="bulk-op" name="op" value={op} onChange={(e) => setOp(e.target.value)} disabled={!picked.length} className="field h-9 w-auto min-w-0 flex-1 rounded-full px-3 text-[13px] sm:flex-none">
          <option value="">Choose an action…</option>
          {OPS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
        {needs && (
          <>
            <label htmlFor="bulk-val" className="sr-only">{needs}</label>
            <input id="bulk-val" name="value" type="number" inputMode="numeric" placeholder={needs} className="field h-9 w-40 rounded-full px-3 text-[13px]" />
          </>
        )}
        <Submit variant="outline" pendingText="Applying…" className="h-9">Apply</Submit>
      </div>

      <ul className="divide-y divide-line rounded-card border border-line bg-paper">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-1 pl-3 transition-colors hover:bg-bone/60 md:pl-4">
            <input type="checkbox" className="check shrink-0" checked={picked.includes(r.id)} onChange={() => toggle(r.id)} aria-label={`Select ${r.name}`} />
            <Link href={`/admin/products/${r.id}`} className="flex min-w-0 flex-1 items-center gap-4 px-3 py-3 md:px-4">
              <span className="relative h-16 w-13 shrink-0 overflow-hidden rounded-[10px] bg-bone">
                <Image src={r.image} alt="" fill sizes="52px" className={r.hidden ? "object-cover opacity-40" : "object-cover"} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-ink">{r.name}</span>
                <span className="mt-0.5 block truncate text-[12.5px] text-muted">{r.subcategory} · {r.sku}</span>
                <span className="mt-1.5 flex flex-wrap gap-1.5">
                  {r.hidden && <Pill>Hidden</Pill>}
                  {r.custom && <Pill tone="info">Added here</Pill>}
                  {r.compare && <Pill tone="info">{r.discount}% off</Pill>}
                  {r.out > 0 && <Pill tone="bad">{r.out} sold out</Pill>}
                  {r.low > 0 && <Pill tone="new">{r.low} low</Pill>}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[14px] font-semibold">{r.price}</span>
                {r.compare && <s className="block text-[12px] text-muted">{r.compare}</s>}
                <span className="block text-[12px] text-muted">{r.total} in stock</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ActionForm>
  );
}

export function CsvTools() {
  return (
    <details className="mb-4 rounded-card border border-line bg-paper p-4">
      <summary className="cursor-pointer text-[13.5px] font-bold text-ink">Spreadsheet import / export (CSV)</summary>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-[13px] text-muted">Download, edit prices, names, sale prices, SEO or stock in Excel or Google Sheets, then import the file back.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/admin/products/export.csv" className="btn btn-outline btn-sm">Download products</a>
            <a href="/admin/products/stock.csv" className="btn btn-outline btn-sm">Download stock</a>
          </div>
        </div>
        <ActionForm action={importCSV} resetOnSuccess className="space-y-3">
          <label htmlFor="csv-file" className="block text-[12px] font-bold text-ink">Import a CSV</label>
          <input id="csv-file" name="file" type="file" accept=".csv,text/csv" className="block w-full text-[13px] file:mr-3 file:h-9 file:rounded-full file:border-0 file:bg-bone file:px-4 file:text-[12.5px] file:font-semibold" />
          <p className="text-[12px] text-muted">Rows are matched by <code>id</code> (products) or <code>sku</code> (stock). Empty cells are left unchanged. Keep the header row.</p>
          <Submit variant="outline" pendingText="Importing…">Import</Submit>
        </ActionForm>
      </div>
    </details>
  );
}
