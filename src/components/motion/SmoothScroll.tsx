"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { finePointer, prefersReducedMotion } from "./useInView";

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/**
 * Inertial wheel scrolling on desktop only (touch keeps native momentum).
 * Off for reduced motion. Pauses automatically while a modal/drawer locks the body.
 * Scrollable panels opt out with data-lenis-prevent.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (!finePointer() || prefersReducedMotion()) return;
    lenis = new Lenis({ duration: 1.05, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true, autoRaf: true, anchors: { offset: -90 } });
    const mo = new MutationObserver(() => {
      if (document.body.style.overflow === "hidden") lenis?.stop();
      else lenis?.start();
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    return () => {
      mo.disconnect();
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  useEffect(() => {
    // Keep Lenis in step with Next's scroll reset on navigation.
    lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
    lenis?.resize();
  }, [pathname]);

  return null;
}
