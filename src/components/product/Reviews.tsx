"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Product, Review } from "@/lib/types";
import { Stars } from "@/components/ui/Rating";
import { Modal } from "@/components/ui/Modal";
import { Check, Star, Upload, CloseIcon } from "@/components/ui/Icons";
import { useStore } from "@/components/providers/StoreProvider";
import { cn } from "@/lib/cn";

type SortKey = "recent" | "highest" | "lowest" | "photos";

async function shrink(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.78);
}

function WriteReview({ product, open, onClose, onCreated }: { product: Product; open: boolean; onClose: () => void; onCreated: (r: Review) => void }) {
  const { user } = useStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ author: "", title: "", body: "", fit: "True to size", quality: 5, sizePurchased: product.sizes[Math.min(2, product.sizes.length - 1)] });
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill name for signed-in users
    if (user && !form.author) setForm((f) => ({ ...f, author: `${user.firstName} ${user.lastName[0]}.` }));
  }, [user, form.author]);

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const next = [...images];
    for (const f of Array.from(files).slice(0, 3 - images.length)) {
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) continue;
      try {
        next.push(await shrink(f));
      } catch {}
    }
    setImages(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!rating) errs.rating = "Please choose a rating";
    if (form.author.trim().length < 2) errs.author = "Enter your name";
    if (form.title.trim().length < 3) errs.title = "Add a short title";
    if (form.body.trim().length < 20) errs.body = "Tell us a little more (20+ characters)";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("loading");
    const res = await fetch("/api/reviews", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, productId: product.id, rating, images }) })
      .then((r) => r.json())
      .catch(() => ({ ok: false, error: "Something went wrong. Please try again." }));
    if (!res.ok) {
      setErrors({ ...(res.fields ?? {}), form: res.error });
      setState("idle");
      return;
    }
    onCreated(res.review);
    setState("done");
  };

  return (
    <Modal open={open} onClose={onClose} title="Write a Review" wide>
      {state === "done" ? (
        <div className="py-8 text-center">
          <Check size={30} className="mx-auto text-success" />
          <p className="display-sm mt-4">Thank you for your review.</p>
          <p className="mt-3 text-[14px] text-muted">Your thoughts help other customers choose with confidence.</p>
          <button type="button" className="btn btn-primary mt-8" onClick={onClose}>
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="field-label">Overall rating</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? "s" : ""}`} onMouseEnter={() => setHover(i)} onClick={() => setRating(i)} className="p-0.5">
                  <Star size={26} filled={(hover || rating) >= i} />
                </button>
              ))}
            </div>
            {errors.rating && <p className="field-error">{errors.rating}</p>}
          </div>
          <div>
            <label htmlFor="rv-name" className="field-label">Name</label>
            <input id="rv-name" className="field" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} aria-invalid={!!errors.author} />
            {errors.author && <p className="field-error">{errors.author}</p>}
          </div>
          <div>
            <label htmlFor="rv-size" className="field-label">Size purchased</label>
            <select id="rv-size" className="field" value={form.sizePurchased} onChange={(e) => setForm({ ...form, sizePurchased: e.target.value })}>
              {product.sizes.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rv-fit" className="field-label">How did it fit?</label>
            <select id="rv-fit" className="field" value={form.fit} onChange={(e) => setForm({ ...form, fit: e.target.value })}>
              <option>Runs small</option>
              <option>True to size</option>
              <option>Runs large</option>
            </select>
          </div>
          <div>
            <label htmlFor="rv-quality" className="field-label">Quality</label>
            <select id="rv-quality" className="field" value={form.quality} onChange={(e) => setForm({ ...form, quality: +e.target.value })}>
              {[5, 4, 3, 2, 1].map((q) => (
                <option key={q} value={q}>
                  {q} — {["", "Poor", "Fair", "Good", "Very good", "Exceptional"][q]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="rv-title" className="field-label">Review title</label>
            <input id="rv-title" className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Sum it up in a line" aria-invalid={!!errors.title} />
            {errors.title && <p className="field-error">{errors.title}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="rv-body" className="field-label">Your review</label>
            <textarea id="rv-body" className="field" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Fabric, fit, finishing — what stood out?" aria-invalid={!!errors.body} />
            {errors.body && <p className="field-error">{errors.body}</p>}
          </div>
          <div className="md:col-span-2">
            <p className="field-label">Add photos (optional, up to 3)</p>
            <div className="flex flex-wrap gap-3">
              {images.map((src, i) => (
                <div key={i} className="relative h-24 w-20 overflow-hidden bg-bone">
                  {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
                  <img src={src} alt={`Upload ${i + 1}`} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center bg-ivory/90" aria-label={`Remove photo ${i + 1}`}>
                    <CloseIcon size={11} />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-beige text-[11px] text-muted hover:border-ink">
                  <Upload size={18} />
                  Upload
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} />
                </label>
              )}
            </div>
          </div>
          {errors.form && <p className="field-error md:col-span-2" role="alert">{errors.form}</p>}
          <div className="md:col-span-2">
            <button type="submit" disabled={state === "loading"} className="btn btn-primary w-full md:w-auto">
              {state === "loading" ? "Submitting…" : "Submit Review"}
            </button>
            <p className="mt-3 text-[11.5px] text-faint">Reviews from verified purchases are marked as Verified Buyer. We publish all reviews — positive and negative — that follow our guidelines.</p>
          </div>
        </form>
      )}
    </Modal>
  );
}

export function Reviews({ product, seeded }: { product: Product; seeded: Review[] }) {
  const [extra, setExtra] = useState<Review[]>([]);
  const [sort, setSort] = useState<SortKey>("recent");
  const [writing, setWriting] = useState(false);
  const [shown, setShown] = useState(4);
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`)
      .then((r) => r.json())
      .then((j) => j.ok && setExtra(j.reviews))
      .catch(() => {});
  }, [product.id]);

  const all = useMemo(() => [...extra, ...seeded], [extra, seeded]);
  const sorted = useMemo(() => {
    const list = sort === "photos" ? all.filter((r) => r.images?.length) : [...all];
    if (sort === "recent") list.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "highest") list.sort((a, b) => b.rating - a.rating);
    if (sort === "lowest") list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [all, sort]);

  const distribution = [5, 4, 3, 2, 1].map((s) => {
    const share = s === 5 ? 0.82 : s === 4 ? 0.13 : s === 3 ? 0.03 : 0.01;
    return { s, pct: Math.round(share * 100) };
  });
  const fitCounts = all.reduce<Record<string, number>>((a, r) => ((a[r.fit] = (a[r.fit] ?? 0) + 1), a), {});
  const trueToSize = Math.round(((fitCounts["True to size"] ?? 0) / Math.max(1, all.length)) * 100);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-28 border-t border-line py-20">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="eyebrow text-muted">Reviews</p>
          <h2 id="reviews-title" className="mt-4 font-serif text-[64px] leading-none">
            {product.rating.toFixed(1)} <span className="text-[28px] text-faint">/ 5</span>
          </h2>
          <div className="mt-3 flex items-center gap-3">
            <Stars value={product.rating} size={16} />
            <span className="text-[13px] text-muted">{product.reviewCount + extra.length} reviews</span>
          </div>
          <ul className="mt-8 space-y-2">
            {distribution.map((d) => (
              <li key={d.s} className="flex items-center gap-3 text-[12px]">
                <span className="w-3 tabular-nums">{d.s}</span>
                <Star size={11} />
                <span className="h-[3px] flex-1 bg-line">
                  <span className="block h-full bg-ink" style={{ width: `${d.pct}%` }} />
                </span>
                <span className="w-8 text-right tabular-nums text-muted">{d.pct}%</span>
              </li>
            ))}
          </ul>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-6 text-center">
            {(["quality", "fit", "value"] as const).map((k) => (
              <div key={k}>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{k}</dt>
                <dd className="mt-1 font-serif text-[28px]">{product.ratingBreakdown[k].toFixed(1)}</dd>
              </div>
            ))}
          </dl>
          {product.fit !== "One Size" && (
            <p className="mt-5 text-[13px] text-muted">
              <span className="text-ink">{trueToSize}%</span> of reviewers say this fits true to size.
            </p>
          )}
          <button type="button" className="btn btn-outline btn-block mt-8" onClick={() => setWriting(true)}>
            Write a Review
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Sort reviews">
            {(
              [
                ["recent", "Most Recent"],
                ["highest", "Highest Rated"],
                ["lowest", "Lowest Rated"],
                ["photos", "With Photos"],
              ] as [SortKey, string][]
            ).map(([k, l]) => (
              <button key={k} type="button" aria-pressed={sort === k} onClick={() => setSort(k)} className={cn("border px-4 py-2 text-[12px] transition-colors", sort === k ? "border-ink bg-ink text-ivory" : "border-line hover:border-ink")}>
                {l}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <p className="py-10 text-[14px] text-muted">No photo reviews yet. Be the first to share how you wear it.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {sorted.slice(0, shown).map((r) => (
                <li key={r.id} className="grid gap-4 py-8 md:grid-cols-[180px_1fr] md:gap-10">
                  <div className="text-[12.5px]">
                    <p className="font-semibold">{r.author}</p>
                    {r.location && <p className="text-muted">{r.location}</p>}
                    {r.verified && (
                      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-success">
                        <Check size={12} /> Verified Buyer
                      </p>
                    )}
                    <dl className="mt-3 space-y-0.5 text-muted">
                      <div>
                        <dt className="inline">Size bought: </dt>
                        <dd className="inline text-ink">{r.sizePurchased}</dd>
                      </div>
                      <div>
                        <dt className="inline">Fit: </dt>
                        <dd className="inline text-ink">{r.fit}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <Stars value={r.rating} />
                      <time className="text-[12px] text-faint" dateTime={r.date}>
                        {new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    </div>
                    <h3 className="mt-3 font-serif text-[22px] leading-snug">{r.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-charcoal">{r.body}</p>
                    {r.images && r.images.length > 0 && (
                      <ul className="mt-4 flex gap-2">
                        {r.images.map((src, i) => (
                          <li key={i} className="relative h-24 w-20 overflow-hidden bg-bone">
                            {src.startsWith("data:") ? (
                              // eslint-disable-next-line @next/next/no-img-element -- customer upload stored as data URL
                              <img src={src} alt={`Customer photo ${i + 1}`} className="h-full w-full object-cover" />
                            ) : (
                              <Image src={src} alt={`Customer photo ${i + 1}`} fill sizes="80px" className="img-grade object-cover" />
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button type="button" disabled={helpful[r.id]} onClick={() => setHelpful({ ...helpful, [r.id]: true })} className="hit mt-4 text-[12px] text-muted hover:text-ink disabled:text-success">
                      {helpful[r.id] ? "Thanks for your feedback" : `Helpful (${r.helpful ?? 0})`}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {shown < sorted.length && (
            <button type="button" onClick={() => setShown((s) => s + 4)} className="btn btn-outline mt-8">
              Show More Reviews
            </button>
          )}
        </div>
      </div>
      <WriteReview product={product} open={writing} onClose={() => setWriting(false)} onCreated={(r) => setExtra((e) => [r, ...e])} />
    </section>
  );
}
