"use client";

import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";
import { useSceneGate } from "./useSceneGate";
import type { ClothVariant } from "./ClothScene";
import type { FabricPreset } from "./fabrics";
import { cn } from "@/lib/cn";

// three.js + R3F are split into their own chunk and only fetched when a scene approaches the viewport.
const ClothScene = dynamic(() => import("./ClothScene"), { ssr: false });

export class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Lazy, self-managing WebGL cloth. The caller owns positioning via className (e.g. "absolute inset-0" or "relative aspect-square").
 * - Mounts only when within ~1 viewport of the screen; pauses its render loop when off-screen.
 * - Picks quality from device signals (coarse pointer, small screen, low core count, Save-Data).
 * - prefers-reduced-motion → a single still frame. No WebGL → the CSS poster stays.
 */
export function Cloth3D({ fabric, variant, className, poster }: { fabric: FabricPreset; variant: ClothVariant; className?: string; poster?: string }) {
  const { ref, mount, active, failed, setFailed, env } = useSceneGate<HTMLDivElement>();
  const [ready, setReady] = useState(false);

  return (
    <div ref={ref} className={cn("overflow-hidden", className ?? "relative")} aria-hidden data-state={failed ? "fallback" : ready ? "ready" : mount && env ? "loading" : "idle"}>
      <div className="absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-lux)]" style={{ background: poster ?? `radial-gradient(120% 90% at 30% 20%, ${fabric.sheenColor}33, transparent 55%), ${fabric.color}`, opacity: ready ? 0 : 1 }} />
      {mount && env && !failed && (
        <SceneBoundary onError={() => setFailed(true)}>
          <div className="absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-lux)]" style={{ opacity: ready ? 1 : 0 }}>
            <ClothScene fabric={fabric} variant={variant} active={active} reducedMotion={env.reduced} quality={env.quality} onReady={() => setReady(true)} />
          </div>
        </SceneBoundary>
      )}
    </div>
  );
}
