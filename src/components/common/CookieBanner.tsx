"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";

export type Consent = { necessary: true; analytics: boolean; marketing: boolean; personalisation: boolean; at: string };
const KEY = "tw.consent.v1";
const EVENT = "tw:consent";
const OPEN_EVENT = "tw:open-cookie-settings";

export function readConsent(): Consent | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {
    return null;
  }
}

function saveConsent(c: Omit<Consent, "necessary" | "at">) {
  const value: Consent = { necessary: true, ...c, at: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function onConsent(fn: (c: Consent) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Consent>).detail);
  window.addEventListener(EVENT, h);
  return () => window.removeEventListener(EVENT, h);
}

export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Cookie Settings
    </button>
  );
}

const CATS = [
  { key: "necessary", title: "Strictly necessary", text: "Required for the bag, checkout, sign-in and security. These cannot be switched off." },
  { key: "analytics", title: "Analytics", text: "Help us understand how the site is used so we can improve it (Google Analytics)." },
  { key: "personalisation", title: "Personalisation", text: "Remember your preferences and tailor recommendations to you." },
  { key: "marketing", title: "Marketing", text: "Measure our campaigns and show you relevant Threads Ware advertising elsewhere (Meta)." },
] as const;

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [manage, setManage] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: true, marketing: false, personalisation: true });

  useEffect(() => {
    const existing = readConsent();
    // Delay so the banner never competes with the first impression of the page.
    const t = existing ? undefined : setTimeout(() => setShow(true), 2200);
    if (existing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync saved preferences
      setPrefs({ analytics: existing.analytics, marketing: existing.marketing, personalisation: existing.personalisation });
    }
    const open = () => setManage(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => {
      if (t) clearTimeout(t);
      window.removeEventListener(OPEN_EVENT, open);
    };
  }, []);

  const decide = (c: typeof prefs) => {
    saveConsent(c);
    setPrefs(c);
    setShow(false);
    setManage(false);
  };

  return (
    <>
      <AnimatePresence>
        {show && !manage && (
          <motion.div
            role="region"
            aria-label="Cookie consent"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[70px] left-3 right-3 z-[70] max-w-[440px] bg-night p-6 text-ivory md:bottom-6 md:left-6 md:right-auto"
          >
            <p className="eyebrow text-[10px] text-champagne-soft">Your Privacy</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ivory/80">
              We use cookies to keep the site secure, remember your bag and understand what you love. See our{" "}
              <Link href="/cookies" className="link-static text-ivory">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" className="btn btn-light btn-sm flex-1" onClick={() => decide({ analytics: true, marketing: true, personalisation: true })}>
                Accept All
              </button>
              <button type="button" className="btn btn-ghost-light btn-sm flex-1" onClick={() => setManage(true)}>
                Manage Preferences
              </button>
            </div>
            <button type="button" onClick={() => decide({ analytics: false, marketing: false, personalisation: false })} className="mt-3 text-[11.5px] text-ivory/55 underline underline-offset-4 hover:text-ivory">
              Necessary only
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={manage} onClose={() => setManage(false)} title="Cookie Preferences">
        <p className="text-[13.5px] text-muted">Choose which cookies Threads Ware may use. You can change this at any time from the footer.</p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {CATS.map((c) => {
            const locked = c.key === "necessary";
            const checked = locked ? true : prefs[c.key as keyof typeof prefs];
            return (
              <li key={c.key} className="flex items-start justify-between gap-6 py-5">
                <div>
                  <p className="text-[14px] font-medium">{c.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{c.text}</p>
                </div>
                <label className="relative mt-1 inline-flex shrink-0 cursor-pointer items-center">
                  <span className="sr-only">{c.title}</span>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={checked}
                    disabled={locked}
                    onChange={(e) => setPrefs((p) => ({ ...p, [c.key]: e.target.checked }))}
                  />
                  <span className="h-6 w-11 rounded-full bg-line transition-colors peer-checked:bg-ink peer-disabled:opacity-60 peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2" />
                  <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-ivory transition-transform duration-300 peer-checked:translate-x-5" />
                </label>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button type="button" className="btn btn-primary flex-1" onClick={() => decide(prefs)}>
            Save Preferences
          </button>
          <button type="button" className="btn btn-outline flex-1" onClick={() => decide({ analytics: true, marketing: true, personalisation: true })}>
            Accept All
          </button>
        </div>
      </Modal>
    </>
  );
}
