"use client";

import { useState } from "react";
import { useStore } from "@/components/providers/StoreProvider";
import { ChevronDown } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

export function PromoCode({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { promo, setPromo, subtotal } = useStore();
  const [open, setOpen] = useState(defaultOpen);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/promo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, subtotal }) });
      const json = await res.json();
      if (!json.ok) setError(json.error);
      else {
        setPromo(json.promo);
        setCode("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (promo)
    return (
      <div className="flex items-center justify-between border border-dashed border-beige px-4 py-3 text-[12.5px]">
        <span>
          <span className="font-semibold tracking-[0.12em]">{promo.code}</span> <span className="text-muted">— {promo.description}</span>
        </span>
        <button type="button" onClick={() => setPromo(null)} className="text-muted link-static hover:text-ink">
          Remove
        </button>
      </div>
    );

  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex min-h-11 w-full items-center justify-between text-[12.5px] tracking-wide">
        Have a promo code?
        <ChevronDown className={cn("transition-transform duration-300", open && "rotate-180")} />
      </button>
      {open && (
        <form onSubmit={apply} className="mt-3">
          <div className="flex gap-2">
            <label htmlFor="promo" className="sr-only">
              Promo code
            </label>
            <input id="promo" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Enter code" className="field h-11 uppercase tracking-[0.1em]" aria-invalid={!!error} aria-describedby={error ? "promo-err" : undefined} />
            <button type="submit" disabled={loading || !code.trim()} className="btn btn-outline btn-sm h-11">
              {loading ? "…" : "Apply"}
            </button>
          </div>
          {error && (
            <p id="promo-err" className="field-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
