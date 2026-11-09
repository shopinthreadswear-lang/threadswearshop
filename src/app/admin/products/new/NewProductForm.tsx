"use client";

import { useState } from "react";
import { createProduct } from "@/app/admin/actions";
import { ActionForm, Field, FieldError, Submit, Toggle } from "@/components/admin/forms";
import { ImageList } from "@/components/admin/ImageField";

const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CHEST_SIZES = ["36", "38", "40", "42", "44", "46"];

export function NewProductForm({ categories }: { categories: { slug: string; name: string; types: string[] }[] }) {
  const [cat, setCat] = useState(categories[0].slug);
  const types = categories.find((c) => c.slug === cat)?.types ?? [];
  const tailored = cat === "blazers-suiting";

  return (
    <ActionForm action={createProduct} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-[14px] font-bold text-ink">The basics</h2>
        <Field label="Product name" name="name" placeholder="The Juhu Linen Shirt" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category" name="category" as="select" value={cat} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </Field>
          <Field label="Type" name="subcategory" as="select" key={cat} defaultValue={types[0]}>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </Field>
        </div>
        <Field label="One-line description" name="shortDescription" placeholder="Breathable Irish linen with a relaxed camp collar." />
        <Field label="Full description" name="description" as="textarea" rows={4} placeholder="Fabric, fit, how it wears, what to pair it with…" />
      </section>

      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="text-[14px] font-bold text-ink">Price</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (₹)" name="price" type="number" inputMode="numeric" min={1} placeholder="2999" hint="GST included." />
          <Field label="Original price (₹) — optional" name="compareAtPrice" type="number" inputMode="numeric" min={1} hint="Only if it’s launching on sale." />
        </div>
      </section>

      <section className="space-y-4 border-t border-line pt-6">
        <h2 className="text-[14px] font-bold text-ink">Photos, colours and sizes</h2>
        <div>
          <p className="mb-1.5 text-[12px] font-bold text-ink">Photos</p>
          <ImageList name="images" folder="products" />
          <FieldError name="images" />
        </div>
        <Field label="Colours" name="colors" as="textarea" rows={3} placeholder={"Sand, #d9c7a7\nNavy, #1f2a44"} hint="One per line: name, then a hex colour code." />
        <fieldset>
          <legend className="mb-2 text-[12px] font-bold text-ink">Sizes</legend>
          <div className="flex flex-wrap gap-2">
            {(tailored ? CHEST_SIZES : LETTER_SIZES).map((s) => (
              <label key={`${cat}-${s}`} className="inline-flex h-11 min-w-12 cursor-pointer items-center justify-center rounded-full border border-line px-4 text-[13px] font-semibold transition-colors has-[:checked]:border-burgundy has-[:checked]:bg-burgundy has-[:checked]:text-cream">
                <input type="checkbox" name="sizes" value={s} defaultChecked={!["XS", "XXL", "36", "46"].includes(s)} className="sr-only" />
                {s}
              </label>
            ))}
          </div>
          <FieldError name="sizes" />
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Starting stock per size" name="stock" type="number" inputMode="numeric" min={0} defaultValue={10} hint="Fine-tune each size after saving." />
          <Field label="Fit" name="fit" as="select" defaultValue={tailored ? "Tailored" : "Regular"}>
            {["Slim", "Regular", "Relaxed", "Oversized", "Tailored", "One Size"].map((f) => <option key={f}>{f}</option>)}
          </Field>
          <Field label="Fabric" name="materials" placeholder="100% linen" />
        </div>
        <Toggle name="isNew" label="Show as a new arrival" defaultChecked hint="Adds it to New Arrivals with a New label." />
      </section>

      <Submit pendingText="Adding…">Add to shop</Submit>
    </ActionForm>
  );
}
