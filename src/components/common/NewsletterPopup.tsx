"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { NewsletterForm } from "./NewsletterForm";
import { readConsent } from "./CookieBanner";
import { IMG } from "@/data/images";

const KEY = "tw.nlpopup.dismissedAt";
const SUPPRESS_DAYS = 14;
const ENGAGED_MS = 45_000;

/** Appears only after meaningful browsing (45s + 2 pages) or desktop exit intent — never on arrival or during checkout. */
export function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- count page views in session
    setPages((p) => p + 1);
  }, [pathname]);

  useEffect(() => {
    const blocked = () => {
      try {
        if (localStorage.getItem("tw.subscribed")) return true;
        const d = Number(localStorage.getItem(KEY) || 0);
        if (Date.now() - d < SUPPRESS_DAYS * 864e5) return true;
      } catch {
        return true;
      }
      return !readConsent() || /^\/(checkout|account|bag|order-confirmation)/.test(pathname);
    };
    if (blocked()) return;
    const timer = setTimeout(() => {
      if (pages >= 2 && !blocked()) setOpen(true);
    }, ENGAGED_MS);
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && pages >= 2 && !blocked()) setOpen(true);
    };
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [pathname, pages]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
  };

  return (
    <Modal open={open} onClose={close} title="Private Access" wide className="sm:max-w-3xl">
      <div className="-mx-6 -my-6 grid sm:-mx-8 sm:-my-8 sm:grid-cols-2">
        <div className="relative hidden aspect-[4/5] sm:block">
          <Image src={IMG.manPortraitKnit} alt="" fill sizes="400px" className="img-grade object-cover" />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-10">
          <p className="eyebrow text-muted">The Threads Wear Letter</p>
          <h3 className="display-md mt-4">Join the world of Threads Wear.</h3>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">Private access to new collections, early releases and editorial stories — plus 10% off your first order.</p>
          <NewsletterForm source="popup" className="mt-8" onDone={() => setTimeout(close, 2600)} />
          <button type="button" onClick={close} className="mt-6 self-start text-[12px] text-muted underline underline-offset-4 hover:text-ink">
            No thank you
          </button>
        </div>
      </div>
    </Modal>
  );
}
