"use client";

import { useEffect, useRef, useState } from "react";

export type SceneEnv = { reduced: boolean; quality: "high" | "low" };

/**
 * Shared lifecycle for every WebGL scene on the site.
 * - mount: only after window load + an idle slot (never competes with first paint) AND once near the viewport
 * - active: true only while on screen and the tab is visible (drives frameloop)
 * - env: reduced-motion + quality tier from device signals; failed: WebGL unavailable
 */
export function useSceneGate<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [mount, setMount] = useState(false);
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const [env, setEnv] = useState<SceneEnv | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const weak = (navigator.hardwareConcurrency ?? 8) <= 4 || !!conn?.saveData;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- device capabilities are only known on the client
    setEnv({ reduced, quality: coarse || window.innerWidth < 900 || weak ? "low" : "high" });
    try {
      const c = document.createElement("canvas");
      if (!(c.getContext("webgl2") || c.getContext("webgl"))) setFailed(true);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let idleId = 0;
    let gate = false;
    let wanted = false;
    const tryMount = () => gate && wanted && setMount(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const open = () => {
      const go = () => {
        gate = true;
        tryMount();
      };
      idleId = w.requestIdleCallback ? w.requestIdleCallback(go, { timeout: 1200 }) : window.setTimeout(go, 300);
    };
    if (document.readyState === "complete") open();
    else window.addEventListener("load", open, { once: true });
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        wanted = true;
        tryMount();
      }
    }, { rootMargin: "100% 0px" });
    const visible = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.01 });
    near.observe(el);
    visible.observe(el);
    const onVis = () => document.hidden && setActive(false);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("load", open);
      if (w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      near.disconnect();
      visible.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return { ref, mount, active, failed, setFailed, env };
}
