"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { requestUpload } from "@/app/admin/actions";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/cn";

/** Send one file to Supabase Storage through a one-time URL from the server. Returns the photo's public link. */
async function upload(file: File, folder: string): Promise<string> {
  const ticket = await requestUpload({ type: file.type, size: file.size, folder });
  if (!ticket.ok) throw new Error(ticket.message);
  const { error } = await createClient().storage.from("media").uploadToSignedUrl(ticket.path, ticket.token, file, { contentType: file.type });
  if (error) throw new Error("The upload didn’t finish. Check your connection and try again.");
  return ticket.publicUrl;
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

function useUploader(folder: string) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const run = async (files: File[], onDone: (url: string) => void) => {
    setError("");
    setBusy((n) => n + files.length);
    for (const f of files) {
      try {
        onDone(await upload(f, folder));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setBusy((n) => n - 1);
      }
    }
  };
  return { busy, error, setError, run };
}

function PasteLink({ onAdd }: { onAdd: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  const id = useId();
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-burgundy hover:underline">
        or paste a link
      </button>
    );
  const add = () => {
    if (/^(https:\/\/|\/)\S+$/.test(v.trim())) {
      onAdd(v.trim());
      setV("");
      setOpen(false);
    }
  };
  return (
    <span className="flex w-full items-center gap-2">
      <label htmlFor={id} className="sr-only">Photo link</label>
      <input
        id={id}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder="https://…"
        className="field h-10 flex-1 text-[13px]"
        autoFocus
      />
      <button type="button" onClick={add} className="h-10 rounded-full border border-line px-4 text-[12.5px] font-semibold hover:border-burgundy hover:text-burgundy">
        Add
      </button>
    </span>
  );
}

/** One photo, controlled. */
export function ImagePicker({ value, onChange, folder, label, aspect = "aspect-[4/5]", className }: { value: string; onChange: (url: string) => void; folder: string; label: string; aspect?: string; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, run } = useUploader(folder);
  return (
    <div className={className}>
      <p className="mb-1.5 text-[12px] font-bold text-ink">{label}</p>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className={cn("relative w-28 shrink-0 overflow-hidden rounded-[12px] border border-line bg-bone transition-colors hover:border-burgundy", aspect)}
          aria-label={value ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
        >
          {value ? <Image src={value} alt="" fill sizes="112px" className="object-cover" /> : <span className="grid h-full place-items-center text-[11px] font-semibold text-muted">No photo</span>}
          {busy > 0 && <span className="absolute inset-0 grid place-items-center bg-paper/80 text-[11px] font-bold text-burgundy">Uploading…</span>}
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy > 0} className="inline-flex h-10 items-center rounded-full bg-burgundy px-4 text-[12.5px] font-semibold text-cream disabled:opacity-60">
            {value ? "Replace photo" : "Upload photo"}
          </button>
          <PasteLink onAdd={onChange} />
          {error && <p role="alert" className="text-[12px] font-medium text-error">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={(e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) void run([f], onChange);
      }} />
    </div>
  );
}

/** One photo inside a normal form: submits its link as `name`. */
export function ImageInput({ name, defaultValue = "", folder, label, aspect }: { name: string; defaultValue?: string; folder: string; label: string; aspect?: string }) {
  const [v, setV] = useState(defaultValue);
  return (
    <>
      <ImagePicker value={v} onChange={setV} folder={folder} label={label} aspect={aspect} />
      <input type="hidden" name={name} value={v} />
    </>
  );
}

/** Several photos in order (first = main). Upload many at once, reorder, remove. Submits each link as `name`. */
export function ImageList({ name, defaultValue = [], folder, max = 10 }: { name: string; defaultValue?: string[]; folder: string; max?: number }) {
  const [list, setList] = useState(defaultValue);
  const input = useRef<HTMLInputElement>(null);
  const { busy, error, setError, run } = useUploader(folder);
  const move = (i: number, d: number) => setList((l) => {
    const n = [...l];
    const j = i + d;
    if (j < 0 || j >= n.length) return l;
    [n[i], n[j]] = [n[j], n[i]];
    return n;
  });
  const add = (url: string) => setList((l) => (l.length < max ? [...l, url] : l));

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2">
        {list.map((src, i) => (
          <li key={src + i} className="group relative aspect-[4/5] overflow-hidden rounded-[12px] border border-line bg-bone">
            <Image src={src} alt="" fill sizes="140px" className="object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-burgundy px-2 py-0.5 text-[10px] font-bold text-cream">Main</span>}
            {i === 1 && <span className="absolute left-1.5 top-1.5 rounded-full bg-paper/90 px-2 py-0.5 text-[10px] font-bold text-ink">Hover</span>}
            <span className="absolute inset-x-1 bottom-1 flex justify-between gap-1">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`} className="grid h-7 w-7 place-items-center rounded-full bg-paper/95 text-[13px] font-bold text-ink shadow disabled:opacity-0">‹</button>
              <button type="button" onClick={() => setList((l) => l.filter((_, n) => n !== i))} aria-label={`Remove photo ${i + 1}`} className="grid h-7 w-7 place-items-center rounded-full bg-paper/95 text-[15px] font-bold text-error shadow">×</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Move photo ${i + 1} later`} className="grid h-7 w-7 place-items-center rounded-full bg-paper/95 text-[13px] font-bold text-ink shadow disabled:opacity-0">›</button>
            </span>
            <input type="hidden" name={name} value={src} />
          </li>
        ))}
        {Array.from({ length: busy }, (_, i) => (
          <li key={`up-${i}`} className="grid aspect-[4/5] animate-pulse place-items-center rounded-[12px] border border-line bg-bone text-[11px] font-bold text-burgundy">Uploading…</li>
        ))}
        {list.length + busy < max && (
          <li>
            <button type="button" onClick={() => input.current?.click()} className="grid aspect-[4/5] w-full place-items-center rounded-[12px] border border-dashed border-beige text-center text-[12px] font-semibold text-ink transition-colors hover:border-burgundy hover:text-burgundy">
              <span>+ Upload<br />photos</span>
            </button>
          </li>
        )}
      </ul>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <PasteLink onAdd={add} />
        <span className="text-[12px] text-muted">First photo is the main one; the second shows on hover. Use the arrows to reorder.</span>
      </div>
      {error && <p role="alert" className="mt-2 text-[12px] font-medium text-error">{error}</p>}
      <input ref={input} type="file" accept={ACCEPT} multiple hidden onChange={(e) => {
        const files = [...(e.target.files ?? [])].slice(0, max - list.length);
        e.target.value = "";
        setError("");
        if (files.length) void run(files, add);
      }} />
    </div>
  );
}
