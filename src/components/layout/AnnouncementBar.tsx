"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { announcements as MESSAGES } from "@/lib/site";


export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 4800);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <div
      className="relative h-9 overflow-hidden bg-espresso font-mono text-[11px] font-semibold text-cream/85"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Announcements"
      aria-live="off"
    >
      {/* Desktop corners, as on a brand's top bar: who we are on the left, the most-used help link on the right */}
      <span className="pointer-events-none absolute left-[var(--spacing-gutter)] top-1/2 z-10 hidden -translate-y-1/2 font-black uppercase italic tracking-[-0.02em] text-cream lg:block">
        Threads Wear <span className="ml-2 font-semibold not-italic tracking-normal text-cream/55">Mumbai</span>
      </span>
      <Link href="/track-order" className="absolute right-[var(--spacing-gutter)] top-1/2 z-10 hidden -translate-y-1/2 items-center gap-1.5 uppercase tracking-[0.08em] text-cream hover:text-champagne-soft lg:flex">
        <span aria-hidden className="text-ochre">●</span> Track order
      </Link>
      {MESSAGES.map((m, idx) => (
        <Link
          key={m.text}
          href={m.href}
          tabIndex={idx === i ? 0 : -1}
          aria-hidden={idx !== i}
          className={cn(
            "absolute inset-0 flex items-center justify-center px-4 text-center transition-[opacity,transform] duration-700 ease-[var(--ease-lux)] hover:text-champagne-soft",
            idx === i ? "translate-y-0 opacity-100" : idx === (i - 1 + MESSAGES.length) % MESSAGES.length ? "-translate-y-full opacity-0" : "translate-y-full opacity-0",
          )}
        >
          <span className="truncate">{m.text}</span>
        </Link>
      ))}
    </div>
  );
}
