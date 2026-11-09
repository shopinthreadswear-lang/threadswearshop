"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/components/providers/StoreProvider";
import { CloseIcon, Check } from "./Icons";
import { cn } from "@/lib/cn";

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div aria-live="polite" aria-atomic="false" className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-8 md:items-end md:px-8">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn("pointer-events-auto flex w-full max-w-sm items-center gap-4 px-5 py-4 text-[13.5px] text-ivory", t.tone === "error" ? "bg-error" : "bg-night")}
            role={t.tone === "error" ? "alert" : "status"}
          >
            {t.tone !== "error" && <Check size={15} className="shrink-0 text-champagne-soft" />}
            <span className="flex-1">{t.message}</span>
            {t.action?.href ? (
              <Link href={t.action.href} className="label-sm link-static text-[11px]" onClick={() => dismissToast(t.id)}>
                {t.action.label}
              </Link>
            ) : t.action?.onClick ? (
              <button
                type="button"
                className="label-sm link-static text-[11px] text-champagne-soft"
                onClick={() => {
                  t.action?.onClick?.();
                  dismissToast(t.id);
                }}
              >
                {t.action.label}
              </button>
            ) : null}
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="-my-2 -mr-3 grid h-11 w-11 place-items-center opacity-70 transition-opacity hover:opacity-100">
              <CloseIcon size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
