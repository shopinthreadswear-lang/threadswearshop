"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Cloth3D } from "@/components/three/Cloth3D";
import { fabricForMaterial } from "@/components/three/fabrics";
import { Sparkle } from "@/components/ui/Icons";

/** "See the cloth" — the product's fabric rendered live. The WebGL scene only exists while the dialog is open. */
export function FabricViewer({ materials, name, colorHex }: { materials: string; name: string; colorHex?: string }) {
  const [open, setOpen] = useState(false);
  const base = fabricForMaterial(materials);
  const fabric = colorHex ? { ...base, color: colorHex } : base;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="group mt-4 flex w-full items-center gap-4 border border-line p-4 text-left transition-colors hover:border-ink">
        <span className="h-10 w-10 shrink-0 rounded-full" style={{ background: `radial-gradient(circle at 35% 30%, ${fabric.sheenColor}, ${fabric.color} 70%)` }} aria-hidden />
        <span className="flex-1">
          <span className="block text-[13.5px]">See the cloth in 3D</span>
          <span className="block text-[12px] text-muted">{base.name} — {base.spec}</span>
        </span>
        <Sparkle size={18} className="text-burgundy transition-transform duration-500 group-hover:rotate-45" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`The cloth — ${name}`} wide>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative bg-night">
            <Cloth3D fabric={fabric} variant="swatch" className="relative aspect-square w-full" />
            <p className="pointer-events-none absolute bottom-3 left-3 text-[11px] uppercase tracking-[0.16em] text-ivory/60">Live 3D · move to ripple</p>
          </div>
          <div>
            <p className="eyebrow text-muted">{base.spec}</p>
            <h3 className="display-sm mt-3">{base.name}</h3>
            <dl className="mt-6 space-y-5">
              {[
                ["What it is", base.what],
                ["Why it matters", base.helps],
                ["What you get", base.outcome],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="eyebrow text-[10px] text-muted">{k}</dt>
                  <dd className="mt-1.5 text-[14.5px] leading-relaxed text-charcoal">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[12px] text-faint">Rendered in real time from our fabric library; colour shown in your selected shade.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
