"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const MESSAGES = [
  { text: "Complimentary shipping on orders above ₹2,999", href: "/shipping" },
  { text: "Easy 15-day returns & free exchanges", href: "/returns" },
  { text: "Secure payments · UPI, cards, net banking & COD", href: "/faq#payments" },
  { text: "The Autumn / Winter ’26 collection is here", href: "/collections/new-season" },
];

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
      className={cn("relative h-9 overflow-hidden bg-burgundy font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-cream transition-colors duration-500 sm:text-[11px] sm:tracking-[0.12em]")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Announcements"
      aria-live="off"
    >
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
