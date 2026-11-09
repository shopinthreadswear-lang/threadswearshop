"use client";

import { saveProduct, saveProductImages, setStock } from "@/app/admin/actions";
import { ImageList } from "@/components/admin/ImageField";
import { ActionForm, Field, Submit, Toggle } from "@/components/admin/forms";
import { Pill } from "@/components/admin/bits";

type P = { id: string; seoTitle?: string; seoDescription?: string; name: string; shortDescription: string; description: string; price: number; compareAtPrice?: number; isNew: boolean; isBestSeller: boolean; hidden: boolean; badge: string };

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
      <details className="rounded-chip border border-line bg-ivory p-3" open={!!(p.seoTitle || p.seoDescription)}>
        <summary className="cursor-pointer text-[13px] font-bold text-ink">Search engines (SEO)</summary>
        <div className="mt-3 space-y-3">
          <Field label="Title in Google" name="seoTitle" defaultValue={p.seoTitle ?? ""} maxLength={70} placeholder={p.name} hint="Leave empty to use the product name. About 60 characters show." />
          <Field label="Description in Google" name="seoDescription" as="textarea" rows={2} defaultValue={p.seoDescription ?? ""} maxLength={170} placeholder={p.shortDescription} hint="Leave empty to use the one-line description. About 155 characters show." />
        </div>
      </details>
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

export function PhotosForm({ productId, images }: { productId: string; images: string[] }) {
  return (
    <ActionForm action={saveProductImages} className="space-y-4">
      <input type="hidden" name="productId" value={productId} />
      <ImageList name="images" defaultValue={images} folder="products" />
      <Submit>Save photos</Submit>
    </ActionForm>
  );
}
