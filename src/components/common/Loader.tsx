"use client";

import { useEffect, useState } from "react";
import { Monogram } from "@/components/ui/Logo";

/** Brief monogram reveal on the first visit of a session (≈900ms). Never blocks interaction or repeat navigation. */
export function Loader() {
  const [state, setState] = useState<"show" | "hide" | "gone">("gone");
  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("tw.loaded");
      sessionStorage.setItem("tw.loaded", "1");
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first-visit only
    setState("show");
    const a = setTimeout(() => setState("hide"), 850);
    const b = setTimeout(() => setState("gone"), 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);
  if (state === "gone") return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] grid place-items-center bg-night text-ivory transition-opacity duration-[650ms] ease-[var(--ease-lux)]"
      style={{ opacity: state === "hide" ? 0 : 1 }}
    >
      <Monogram size={72} animated className="text-champagne-soft" />
    </div>
  );
}
