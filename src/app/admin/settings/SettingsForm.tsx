"use client";

import { useState } from "react";
import type { StoreSettings } from "@/lib/catalog";
import { saveSettings } from "@/app/admin/actions";
import { ActionForm, Field, FieldError, Submit } from "@/components/admin/forms";

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [rows, setRows] = useState(settings.announcements.map((a, i) => ({ ...a, key: i })));
  return (
    <ActionForm action={saveSettings} className="space-y-8">
      <section>
        <h2 className="text-[14px] font-bold text-ink">Message bar</h2>
        <p className="mb-4 mt-1 text-[13px] text-muted">These rotate at the top of every page. Keep them short — under 60 characters reads best on phones.</p>
        <ul className="space-y-3">
          {rows.map((r, i) => (
            <li key={r.key} className="grid gap-2 rounded-chip border border-line bg-ivory p-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
              <div>
                <label htmlFor={`ann-${r.key}`} className="mb-1 block text-[12px] font-bold">Message {i + 1}</label>
                <input id={`ann-${r.key}`} name="annText" defaultValue={r.text} maxLength={90} className="field" />
              </div>
              <div>
                <label htmlFor={`href-${r.key}`} className="mb-1 block text-[12px] font-bold">Links to</label>
                <input id={`href-${r.key}`} name="annHref" defaultValue={r.href} placeholder="/shipping" className="field" />
              </div>
              <button type="button" onClick={() => setRows(rows.filter((x) => x.key !== r.key))} disabled={rows.length === 1} className="h-11 rounded-full px-4 text-[12.5px] font-semibold text-error hover:bg-error/8 disabled:opacity-30">
                Remove
              </button>
            </li>
          ))}
        </ul>
        <FieldError name="announcements" />
        <FieldError name="announcements.0.href" />
        {rows.length < 6 && (
          <button type="button" onClick={() => setRows([...rows, { text: "", href: "/", key: Date.now() }])} className="mt-3 inline-flex h-10 items-center rounded-full border border-dashed border-beige px-4 text-[13px] font-semibold text-ink hover:border-burgundy hover:text-burgundy">
            + Add a message
          </button>
        )}
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-[14px] font-bold text-ink">Shipping</h2>
        <p className="mb-4 mt-1 text-[13px] text-muted">Used in the bag, at checkout and on product pages. All amounts in rupees.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Field label="Free shipping above (₹)" name="freeShippingThreshold" type="number" inputMode="numeric" min={0} defaultValue={settings.freeShippingThreshold} hint="0 = always free" />
          <Field label="Standard shipping (₹)" name="standardShipping" type="number" inputMode="numeric" min={0} defaultValue={settings.standardShipping} />
          <Field label="Express shipping (₹)" name="expressShipping" type="number" inputMode="numeric" min={0} defaultValue={settings.expressShipping} />
          <Field label="Cash on delivery fee (₹)" name="codFee" type="number" inputMode="numeric" min={0} defaultValue={settings.codFee} />
        </div>
      </section>
      <Submit>Save settings</Submit>
    </ActionForm>
  );
}
