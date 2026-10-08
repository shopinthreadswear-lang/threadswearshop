"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, CloseIcon, Zoom } from "@/components/ui/Icons";
import { useMounted } from "@/lib/useMounted";
import { cn } from "@/lib/cn";

const VIEW_LABELS = ["Front", "On model", "Detail", "Styling", "Fabric", "Back"];

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const mounted = useMounted();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset to first image on colour change
    setActive(0);
    track.current?.scrollTo({ left: 0 });
  }, [images]);

  const onScroll = () => {
    const el = track.current;
    if (el) setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  const alt = (i: number) => `${name} — ${VIEW_LABELS[i % VIEW_LABELS.length].toLowerCase()} view`;

  return (
    <>
      {/* Mobile: swipe gallery */}
      <div data-pdp-media className="relative md:hidden">
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" aria-roledescription="carousel" aria-label={`${name} images`}>
          {images.map((src, i) => (
            <button key={src + i} type="button" onClick={() => setLightbox(i)} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-bone" aria-label={`Open image ${i + 1} of ${images.length} fullscreen`}>
              <Image src={src} alt={alt(i)} fill priority={i === 0} sizes="100vw" className="img-grade object-cover" />
            </button>
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5" aria-hidden>
          {images.map((_, i) => (
            <span key={i} className={cn("h-[3px] transition-all duration-500", i === active ? "w-6 bg-ink" : "w-3 bg-ink/25")} />
          ))}
        </div>
        <span className="absolute right-4 top-4 bg-ivory/85 px-2 py-1 text-[11px] tabular-nums">
          {active + 1} / {images.length}
        </span>
      </div>

      {/* Desktop: editorial stack */}
      <div className="hidden grid-cols-2 gap-1.5 md:grid">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setLightbox(i)}
            data-cursor="Zoom"
            data-pdp-media={i === 0 ? "" : undefined}
            className={cn("group relative cursor-zoom-in overflow-hidden bg-bone", i === 0 || i === 3 ? "col-span-2 aspect-[4/5]" : "aspect-[3/4]")}
            aria-label={`Zoom ${alt(i)}`}
          >
            <Image src={src} alt={alt(i)} fill priority={i === 0} sizes={i === 0 || i === 3 ? "(max-width:1280px) 58vw, 60vw" : "30vw"} className="img-grade object-cover transition-transform duration-[1400ms] ease-[var(--ease-lux)] group-hover:scale-[1.025]" />
            <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center bg-ivory/85 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <Zoom size={16} />
            </span>
          </button>
        ))}
      </div>

      {mounted && createPortal(<Lightbox images={images} index={lightbox} setIndex={setLightbox} name={name} />, document.body)}
    </>
  );
}

function Lightbox({ images, index, setIndex, name }: { images: string[]; index: number | null; setIndex: (i: number | null) => void; name: string }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex(((index ?? 0) + 1) % images.length);
      if (e.key === "ArrowLeft") setIndex(((index ?? 0) - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, index, images.length, setIndex]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset zoom per image
    setZoom(false);
  }, [index]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-label={`${name} gallery`} className="fixed inset-0 z-[95] bg-ivory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 md:px-8">
            <span className="text-[12px] tabular-nums text-muted">
              {(index ?? 0) + 1} / {images.length}
            </span>
            <button ref={closeRef} type="button" onClick={() => setIndex(null)} className="flex items-center gap-2 p-2 label-sm hover:opacity-60" aria-label="Close gallery">
              Close <CloseIcon size={18} />
            </button>
          </div>
          <div
            className={cn("absolute inset-0 overflow-hidden", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
              setZoom((z) => !z);
            }}
            onMouseMove={(e) => {
              if (!zoom) return;
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} className="absolute inset-0">
                <Image
                  src={images[index ?? 0]}
                  alt={`${name} — image ${(index ?? 0) + 1}`}
                  fill
                  sizes="100vw"
                  quality={90}
                  className="img-grade object-contain transition-transform duration-500 ease-[var(--ease-lux)]"
                  style={{ transform: zoom ? "scale(2.2)" : "scale(1)", transformOrigin: origin }}
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <button type="button" onClick={() => setIndex(((index ?? 0) - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center bg-ivory/80 hover:bg-ivory md:left-8" aria-label="Previous image">
            <ArrowLeft />
          </button>
          <button type="button" onClick={() => setIndex(((index ?? 0) + 1) % images.length)} className="absolute right-3 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center bg-ivory/80 hover:bg-ivory md:right-8" aria-label="Next image">
            <ArrowRight />
          </button>
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center gap-2 p-4">
            {images.map((src, i) => (
              <button key={src + i} type="button" onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} aria-current={i === index} className={cn("relative h-16 w-12 overflow-hidden bg-bone transition-opacity", i === index ? "opacity-100 outline outline-1 outline-ink" : "opacity-50 hover:opacity-100")}>
                <Image src={src} alt="" fill sizes="48px" className="object-cover" />
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
