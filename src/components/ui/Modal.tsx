"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CloseIcon } from "./Icons";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/useMounted";

const EASE = [0.22, 1, 0.36, 1] as const;

export function useDialog(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      const el = panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panelRef.current?.querySelector<HTMLElement>("button, [href], input, select, textarea");
      el?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panelRef.current) {
        const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);
  return panelRef;
}

function Portal({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  return mounted ? createPortal(children, document.body) : null;
}

export function Modal({ open, onClose, title, children, className, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string; wide?: boolean }) {
  const ref = useDialog(open, onClose);
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6">
            <motion.div className="absolute inset-0 bg-night/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} onClick={onClose} />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: EASE }}
              data-lenis-prevent
              className={cn("relative max-h-[92dvh] w-full overflow-y-auto bg-ivory", wide ? "sm:max-w-4xl" : "sm:max-w-lg", className)}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-ivory px-6 py-5 sm:px-8">
                <h2 className="label-sm">{title}</h2>
                <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 p-2 hover:opacity-60 transition-opacity">
                  <CloseIcon size={18} />
                </button>
              </div>
              <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = "right",
  footer,
  className,
  headerExtra,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  side?: "right" | "left" | "bottom";
  footer?: ReactNode;
  className?: string;
  headerExtra?: ReactNode;
}) {
  const ref = useDialog(open, onClose);
  const from = side === "right" ? { x: "100%" } : side === "left" ? { x: "-100%" } : { y: "100%" };
  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[80]">
            <motion.div className="absolute inset-0 bg-night/45" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={onClose} />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-label={typeof title === "string" ? title : undefined}
              initial={from}
              animate={{ x: 0, y: 0 }}
              exit={from}
              transition={{ duration: 0.6, ease: EASE }}
              className={cn(
                "absolute flex flex-col bg-ivory",
                side === "right" && "inset-y-0 right-0 w-full sm:w-[460px]",
                side === "left" && "inset-y-0 left-0 w-[88%] max-w-[420px]",
                side === "bottom" && "inset-x-0 bottom-0 max-h-[88dvh]",
                className,
              )}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-line px-6 py-5">
                <div className="label-sm flex items-center gap-3">{title}</div>
                <div className="flex items-center gap-3">
                  {headerExtra}
                  <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 p-2 hover:opacity-60 transition-opacity">
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent>
                {children}
              </div>
              {footer && <div className="shrink-0 border-t border-line">{footer}</div>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
