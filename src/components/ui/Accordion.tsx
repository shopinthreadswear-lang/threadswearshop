"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "./Icons";
import { cn } from "@/lib/cn";

export function AccordionItem({ title, children, defaultOpen = false, className, id }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string; id?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  return (
    <div className={cn("border-b border-line", className)} id={id}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${uid}-panel`}
          id={`${uid}-btn`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-6 py-5 text-left label-sm group"
        >
          <span className="group-hover:opacity-70 transition-opacity">{title}</span>
          <Plus className={cn("shrink-0 transition-transform duration-500 ease-[var(--ease-lux)]", open && "rotate-45")} />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${uid}-panel`}
            role="region"
            aria-labelledby={`${uid}-btn`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[14.5px] leading-relaxed text-charcoal">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
