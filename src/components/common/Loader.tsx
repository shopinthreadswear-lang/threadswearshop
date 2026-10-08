"use client";

import { useEffect, useRef, useState } from "react";

/** Background of the brand film; the frame's edges are also feathered so no rectangle shows. */
const FILM_BG = "#f0e6da";
const FEATHER = { maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)" };

/**
 * Brand film on the first visit of a session: the needle draws the "T" and THREADS settles in (0.5s), then the
 * screen lifts away. Never blocks interaction or repeat navigation; skipped entirely under reduced motion.
 * If the film can't autoplay (e.g. iOS Low Power Mode) the finished logo frame is shown for the same half second.
 */
export function Loader() {
  const [state, setState] = useState<"show" | "hide" | "gone">("gone");
  const [still, setStill] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem("tw.loaded");
      sessionStorage.setItem("tw.loaded", "1");
    } catch {}
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first-visit only
    setState("show");
    const cap = setTimeout(() => setState((s) => (s === "show" ? "hide" : s)), 700); // never longer than this
    return () => clearTimeout(cap);
  }, []);

  useEffect(() => {
    if (state === "show") {
      const v = video.current;
      v?.play().catch(() => {
        setStill(true);
        setTimeout(() => setState("hide"), 500);
      });
    }
    if (state === "hide") {
      const t = setTimeout(() => setState("gone"), 450);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (state === "gone") return null;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200] grid place-items-center transition-[opacity,transform] duration-[450ms] ease-[var(--ease-lux)]"
      style={{ background: FILM_BG, opacity: state === "hide" ? 0 : 1, transform: state === "hide" ? "scale(1.03)" : "none" }}
    >
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element -- tiny local still, shown only when autoplay is refused
        <img src="/brand/loader-end.jpg" alt="" className="w-[min(78vw,560px)] mix-blend-darken" style={FEATHER} />
      ) : (
        <video
          ref={video}
          className="w-[min(78vw,560px)] mix-blend-darken"
          style={FEATHER}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          onEnded={() => setState("hide")}
        >
          <source src="/brand/loader.webm" type="video/webm" />
          <source src="/brand/loader.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
