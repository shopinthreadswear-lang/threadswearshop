"use client";

import { saveProduct, setStock } from "@/app/admin/actions";
import { ActionForm, Field, Submit, Toggle } from "@/components/admin/forms";
import { Pill } from "@/components/admin/bits";

type P = { id: string; name: string; shortDescription: string; description: string; price: number; compareAtPrice?: number; isNew: boolean; isBestSeller: boolean; hidden: boolean; badge: string };

export function ProductForm({ product: p, offerNote }: { product: P; offerNote?: string }) {
  return (
    <ActionForm action={saveProduct} className="space-y-4">
      <input type="hidden" name="productId" value={p.id} />
      <Field label="Name" name="name" defaultValue={p.name} />
      <Field label="One-line description" name="shortDescription" defaultValue={p.shortDescription} hint="Shown under the name on the product page." />
      <Field label="Full description" name="description" as="textarea" rows={5} defaultValue={p.description} />
      {offerNote && <p className="rounded-chip bg-burgundy/8 px-4 py-3 text-[12.5px] text-burgundy">{offerNote}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (₹)" name="price" type="number" inputMode="numeric" min={1} defaultValue={p.price} hint="What the customer pays, GST included." />
        <Field label="Original price (₹) — optional" name="compareAtPrice" type="number" inputMode="numeric" min={1} defaultValue={p.compareAtPrice ?? ""} hint="Fill this to put the piece on sale; shown crossed out." />
      </div>
      <Field label="Label on the photo" name="badge" as="select" defaultValue={p.badge}>
        <option value="auto">Automatic (Sale, New or Bestseller)</option>
        <option value="none">No label</option>
        <option value="New">New</option>
        <option value="Bestseller">Bestseller</option>
        <option value="Limited Edition">Limited Edition</option>
        <option value="Sale">Sale</option>
      </Field>
      <div className="grid gap-1 sm:grid-cols-3">
        <Toggle name="isNew" label="New arrival" defaultChecked={p.isNew} hint="Listed in New Arrivals" />
        <Toggle name="isBestSeller" label="Best seller" defaultChecked={p.isBestSeller} hint="Listed in Best Sellers" />
        <Toggle name="hidden" label="Hide from shop" defaultChecked={p.hidden} hint="Customers can’t find or buy it" />
      </div>
      <Submit>Save changes</Submit>
    </ActionForm>
  );
}

export function StockRow({ productId, sku, label, available }: { productId: string; sku: string; label: string; available: number }) {
  return (
    <li className="py-2.5">
      <ActionForm action={setStock} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="sku" value={sku} />
        <span className="min-w-[140px] flex-1">
          <span className="block text-[13.5px] font-semibold text-ink">{label}</span>
          <span className="block text-[11.5px] text-muted">{sku}</span>
        </span>
        {available === 0 ? <Pill tone="bad">Sold out</Pill> : available <= 3 ? <Pill tone="new">Low</Pill> : null}
        <label className="sr-only" htmlFor={`qty-${sku}`}>Units on hand for {label}</label>
        <input id={`qty-${sku}`} name="qty" type="number" inputMode="numeric" min={0} defaultValue={available} className="field h-11 w-24 rounded-full px-4 text-center" />
        <Submit variant="outline" pendingText="…">Save</Submit>
      </ActionForm>
    </li>
  );
}
