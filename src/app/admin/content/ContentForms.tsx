"use client";

import { useState } from "react";
import type { ContactContent, HeroSlide, HomeContent } from "@/lib/content";
import { saveContact, saveHero, saveHomeText } from "@/app/admin/actions";
import { ActionForm, Field, Submit } from "@/components/admin/forms";
import { ImageInput, ImagePicker } from "@/components/admin/ImageField";

/* ─── Hero slides ────────────────────────────────────────── */

const FOCUS = [
  { v: "50% 20%", label: "Top" },
  { v: "50% 30%", label: "Upper middle" },
  { v: "50% 50%", label: "Centre" },
  { v: "50% 75%", label: "Lower" },
];

const blank = (): HeroSlide => ({ img: "", alt: "", tag: "", line1: "", line2: "collection", productSlug: "", href: "/shop", button: "Shop collection", focus: "50% 30%" });

export function HeroForm({ slides: initial, products }: { slides: HeroSlide[]; products: { slug: string; name: string }[] }) {
  const [slides, setSlides] = useState(() => initial.map((s, i) => ({ ...s, _k: i })));
  const set = (i: number, patch: Partial<HeroSlide>) => setSlides((l) => l.map((s, n) => (n === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) =>
    setSlides((l) => {
      const n = [...l];
      [n[i], n[i + d]] = [n[i + d], n[i]];
      return n;
    });
  const payload = JSON.stringify(slides.map(({ _k, ...s }) => (void _k, s)));

  return (
    <ActionForm action={saveHero} className="space-y-5">
      <p className="text-[13px] text-muted">The big rotating banner at the top of the homepage. Photos look best tall (portrait), at least 1200px wide, with the person on the right half.</p>
      <ol className="space-y-4">
        {slides.map((s, i) => (
          <li key={s._k} className="rounded-card border border-line bg-ivory p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-[14px] font-bold text-ink">Slide {i + 1}</h3>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="h-9 rounded-full border border-line px-3 text-[12px] font-semibold disabled:opacity-30">↑ Up</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="h-9 rounded-full border border-line px-3 text-[12px] font-semibold disabled:opacity-30">↓ Down</button>
                <button type="button" onClick={() => setSlides((l) => l.filter((_, n) => n !== i))} disabled={slides.length === 1} className="h-9 rounded-full px-3 text-[12px] font-semibold text-error hover:bg-error/8 disabled:opacity-30">Remove</button>
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,260px)_1fr]">
              <div className="space-y-3">
                <ImagePicker value={s.img} onChange={(img) => set(i, { img })} folder="hero" label="Photo" />
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-bold text-ink">Keep in view</span>
                  <select value={s.focus} onChange={(e) => set(i, { focus: e.target.value })} className="field">
                    {FOCUS.map((f) => <option key={f.v} value={f.v}>{f.label}</option>)}
                  </select>
                </label>
              </div>
              <div className="grid content-start gap-3 sm:grid-cols-2">
                <L label="Big title — line 1" value={s.line1} onChange={(line1) => set(i, { line1 })} max={24} placeholder="Everyday" />
                <L label="Big title — line 2" value={s.line2} onChange={(line2) => set(i, { line2 })} max={24} placeholder="collection" />
                <L label="Small line above the title" value={s.tag} onChange={(tag) => set(i, { tag })} max={80} className="sm:col-span-2" />
                <L label="Button text" value={s.button} onChange={(button) => set(i, { button })} max={30} />
                <L label="Button goes to" value={s.href} onChange={(href) => set(i, { href })} max={200} placeholder="/men/shirts" />
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[12px] font-bold text-ink">Price tag shows</span>
                  <select value={s.productSlug} onChange={(e) => set(i, { productSlug: e.target.value })} className="field">
                    <option value="">No price tag</option>
                    {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
                  </select>
                </label>
                <L label="Photo description (for screen readers)" value={s.alt} onChange={(alt) => set(i, { alt })} max={140} className="sm:col-span-2" placeholder="Man in a white shirt against a warm wall" />
              </div>
            </div>
          </li>
        ))}
      </ol>
      {slides.length < 6 && (
        <button type="button" onClick={() => setSlides((l) => [...l, { ...blank(), _k: Date.now() }])} className="inline-flex h-11 items-center rounded-full border border-dashed border-beige px-5 text-[13px] font-semibold text-ink hover:border-burgundy hover:text-burgundy">
          + Add a slide
        </button>
      )}
      <input type="hidden" name="payload" value={payload} />
      <div>
        <Submit>Save hero</Submit>
      </div>
    </ActionForm>
  );
}

function L({ label, value, onChange, max, placeholder, className }: { label: string; value: string; onChange: (v: string) => void; max: number; placeholder?: string; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-[12px] font-bold text-ink">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} maxLength={max} placeholder={placeholder} className="field" />
    </label>
  );
}

/* ─── Homepage sections ──────────────────────────────────── */

const PROMISE_HINT = "Tip: {freeShipping} shows your free-shipping amount and {returnDays} the return window, so they stay correct when settings change.";

export function HomeTextForm({ home }: { home: HomeContent }) {
  return (
    <ActionForm action={saveHomeText} className="space-y-8">
      <section>
        <h3 className="text-[14px] font-bold text-ink">Promise boxes</h3>
        <p className="mb-4 mt-1 text-[13px] text-muted">The four boxes right under the hero. {PROMISE_HINT}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {home.promises.map((p, i) => (
            <div key={i} className="space-y-3 rounded-chip border border-line bg-ivory p-3">
              <Field label={`Box ${i + 1} title`} name={`promise${i}Title`} defaultValue={p.title} maxLength={40} />
              <Field label="Line under it" name={`promise${i}Text`} defaultValue={p.text} maxLength={80} />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <h3 className="text-[14px] font-bold text-ink">Section headings</h3>
        <p className="mb-4 mt-1 text-[13px] text-muted">The second part of each heading shows in burgundy.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="space-y-3 rounded-chip border border-line bg-ivory p-3">
            <legend className="px-1 text-[12px] font-bold text-muted">Best sellers</legend>
            <Field label="Heading" name="shelfTitle" defaultValue={home.shelf.title} maxLength={40} />
            <Field label="Heading, burgundy part" name="shelfAccent" defaultValue={home.shelf.accent} maxLength={40} />
            <Field label="Line under it" name="shelfSub" defaultValue={home.shelf.sub} maxLength={140} />
          </fieldset>
          <fieldset className="space-y-3 rounded-chip border border-line bg-ivory p-3">
            <legend className="px-1 text-[12px] font-bold text-muted">New arrivals</legend>
            <Field label="Heading" name="freshTitle" defaultValue={home.fresh.title} maxLength={40} />
            <Field label="Heading, burgundy part" name="freshAccent" defaultValue={home.fresh.accent} maxLength={40} />
            <Field label="Line under it" name="freshSub" defaultValue={home.fresh.sub} maxLength={140} />
          </fieldset>
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <h3 className="text-[14px] font-bold text-ink">Story block</h3>
        <p className="mb-4 mt-1 text-[13px] text-muted">The burgundy block with two photos, halfway down the homepage.</p>
        <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,300px)]">
          <div className="grid content-start gap-3 sm:grid-cols-2">
            <Field label="Small line above" name="storyEyebrow" defaultValue={home.story.eyebrow} maxLength={40} />
            <Field label="Sticker on the photo" name="storyBadge" defaultValue={home.story.badge} maxLength={30} hint="Leave empty to hide it." />
            <Field label="Heading" name="storyTitle" defaultValue={home.story.title} maxLength={60} />
            <Field label="Heading, highlighted part" name="storyAccent" defaultValue={home.story.accent} maxLength={40} />
            <Field label="Text" name="storyBody" as="textarea" rows={5} defaultValue={home.story.body} maxLength={900} className="sm:col-span-2" />
            <Field label="Button text" name="storyButton" defaultValue={home.story.button} maxLength={30} />
            <Field label="Button goes to" name="storyHref" defaultValue={home.story.href} maxLength={200} />
          </div>
          <div className="space-y-4">
            <ImageInput name="storyImg1" defaultValue={home.story.img1} folder="home" label="Large photo" />
            <ImageInput name="storyImg2" defaultValue={home.story.img2} folder="home" label="Small round photo" aspect="aspect-square" />
          </div>
        </div>
      </section>
      <Submit>Save homepage</Submit>
    </ActionForm>
  );
}

/* ─── Contact & social ───────────────────────────────────── */

export function ContactForm({ contact: c }: { contact: ContactContent }) {
  return (
    <ActionForm action={saveContact} className="space-y-8">
      <section>
        <p className="mb-4 text-[13px] text-muted">Shown in the footer and on the Contact and Stores pages.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer care email" name="email" type="email" defaultValue={c.email} />
          <Field label="Phone" name="phone" type="tel" defaultValue={c.phone} />
          <Field label="WhatsApp number" name="whatsapp" type="tel" defaultValue={c.whatsapp} hint="With country code, e.g. +91 98200 26026" />
          <Field label="Opening hours" name="hours" defaultValue={c.hours} />
        </div>
      </section>
      <section className="border-t border-line pt-6">
        <h3 className="mb-4 text-[14px] font-bold text-ink">Address</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address line 1" name="line1" defaultValue={c.line1} />
          <Field label="Address line 2" name="line2" defaultValue={c.line2} />
          <Field label="City" name="city" defaultValue={c.city} />
          <Field label="State" name="state" defaultValue={c.state} />
          <Field label="PIN code" name="pincode" inputMode="numeric" defaultValue={c.pincode} />
        </div>
      </section>
      <section className="border-t border-line pt-6">
        <h3 className="text-[14px] font-bold text-ink">Social links</h3>
        <p className="mb-4 mt-1 text-[13px] text-muted">Full links. Leave one empty to hide its icon.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instagram" name="instagram" type="url" defaultValue={c.instagram} placeholder="https://www.instagram.com/…" />
          <Field label="Facebook" name="facebook" type="url" defaultValue={c.facebook} placeholder="https://www.facebook.com/…" />
          <Field label="YouTube" name="youtube" type="url" defaultValue={c.youtube} placeholder="https://www.youtube.com/@…" />
          <Field label="Pinterest" name="pinterest" type="url" defaultValue={c.pinterest} placeholder="https://www.pinterest.com/…" />
        </div>
      </section>
      <Submit>Save contact details</Submit>
    </ActionForm>
  );
}
