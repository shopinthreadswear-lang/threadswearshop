"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useDialog } from "@/components/ui/Modal";
import { Wordmark } from "@/components/ui/Logo";
import { MenuToggle } from "./MenuToggle";
import { megaMenu } from "@/data/navigation";
import { collections } from "@/data/collections";
import { slugifyType } from "@/data/categories";
import { IMG } from "@/data/images";
import { ChevronDown } from "@/components/ui/Icons";
import { useStore } from "@/components/providers/StoreProvider";
import { useMounted } from "@/lib/useMounted";
import { cn } from "@/lib/cn";

const EASE = [0.22, 1, 0.36, 1] as const;

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-2 text-left text-[15px]">
        {label}
        <ChevronDown size={13} className={cn("transition-transform duration-[450ms]", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-[grid-template-rows] duration-[450ms] ease-[var(--ease-lux)]", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden" inert={!open}>
          <ul className="grid grid-cols-2 gap-x-4 pb-3 pl-1">{children}</ul>
        </div>
      </div>
    </div>
  );
}

/**
 * Full-screen mobile navigation. Primary destinations are large serif links (staggered 50ms, 600ms);
 * category depth sits behind one tap. Focus is trapped; Escape closes; the toggle morphs to an X.
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useStore();
  const mounted = useMounted();
  const ref = useDialog(open, onClose);
  const [section, setSection] = useState<"clothing" | "collections" | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when reopened
    if (!open) setSection(null);
  }, [open]);

  const primary: { label: string; href?: string; key?: "clothing" | "collections"; tone?: string }[] = [
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Clothing", key: "clothing" },
    { label: "Designer Wear", href: "/men/designer-wear" },
    { label: "Collections", key: "collections" },
    { label: "Best Sellers", href: "/best-sellers" },
    { label: "Sale", href: "/sale", tone: "text-error" },
  ];

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-0 z-[85] flex flex-col overflow-y-auto bg-ivory text-ink"
        >
          <div className="container-site flex h-[64px] shrink-0 items-center justify-between border-b border-line">
            <MenuToggle open onClick={onClose} className="-ml-2" label="Close menu" />
            <Link href="/" onClick={onClose} aria-label="Threads Ware — home">
              <Wordmark compact />
            </Link>
            <span className="w-10" />
          </div>

          <nav aria-label="Mobile" className="container-site flex-1 pb-12 pt-6">
            <ul>
              {primary.map((p, i) => (
                <motion.li key={p.label} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.18 + i * 0.05 }} className="border-b border-line">
                  {p.href ? (
                    <Link href={p.href} onClick={onClose} className={cn("flex items-baseline justify-between py-4 font-serif text-[34px] leading-none", p.tone)}>
                      {p.label}
                      <span className="text-[11px] text-faint">0{i + 1}</span>
                    </Link>
                  ) : (
                    <>
                      <button type="button" aria-expanded={section === p.key} onClick={() => setSection(section === p.key ? null : p.key!)} className="flex w-full items-baseline justify-between py-4 text-left font-serif text-[34px] leading-none">
                        {p.label}
                        <ChevronDown size={16} className={cn("transition-transform duration-[450ms]", section === p.key && "rotate-180")} />
                      </button>
                      <div className={cn("grid transition-[grid-template-rows] duration-[450ms] ease-[var(--ease-lux)]", section === p.key ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                        <div className="overflow-hidden" inert={section !== p.key}>
                          {p.key === "clothing" ? (
                            <div className="space-y-1 pb-5">
                              <Link href="/men/clothing" onClick={onClose} className="block py-2 text-[13px] font-semibold uppercase tracking-[0.14em]">
                                Shop All Clothing →
                              </Link>
                              {megaMenu.topwear.map((g) => (
                                <Group key={g.slug} label={g.title}>
                                  <li className="col-span-2">
                                    <Link href={`/men/${g.slug}`} onClick={onClose} className="block py-1.5 text-[13.5px] text-ink">
                                      All {g.title}
                                    </Link>
                                  </li>
                                  {g.types.map((t) => (
                                    <li key={t}>
                                      <Link href={`/men/${g.slug}?type=${slugifyType(t)}`} onClick={onClose} className="block py-1.5 text-[13px] text-muted">
                                        {t}
                                      </Link>
                                    </li>
                                  ))}
                                </Group>
                              ))}
                              {megaMenu.more.map((g) => (
                                <Group key={g.title} label={g.title}>
                                  {g.items.map(([l, h]) => (
                                    <li key={h}>
                                      <Link href={h} onClick={onClose} className="block py-1.5 text-[13px] text-muted">
                                        {l}
                                      </Link>
                                    </li>
                                  ))}
                                </Group>
                              ))}
                            </div>
                          ) : (
                            <ul className="grid grid-cols-2 gap-x-4 pb-5">
                              {collections.map((c) => (
                                <li key={c.slug}>
                                  <Link href={`/collections/${c.slug}`} onClick={onClose} className="block py-2 text-[13.5px] text-muted">
                                    {c.name.replace(/^The /, "")}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.li>
              ))}
            </ul>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}>
              <Link href="/collections/signature" onClick={onClose} className="relative mt-8 block aspect-[16/9] overflow-hidden">
                <Image src={IMG.manSuedeStreet} alt="The Signature Collection" fill sizes="90vw" className="img-grade object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/65 to-transparent" />
                <div className="absolute bottom-4 left-4 text-cream">
                  <p className="eyebrow text-[11px] opacity-80">Now In</p>
                  <p className="font-serif text-[22px]">The Signature Collection</p>
                </div>
              </Link>
              <ul className="mt-8 grid grid-cols-2 gap-y-2">
                {[
                  [user ? `Account — ${user.firstName}` : "Sign In", user ? "/account" : "/account/login"],
                  ["Wishlist", "/wishlist"],
                  ["Track Order", "/track-order"],
                  ["Journal", "/journal"],
                  ["Our Story", "/our-story"],
                  ["Customer Care", "/contact"],
                ].map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} onClick={onClose} className="block py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-charcoal">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-[12px] text-muted">India / INR ₹ · Free shipping over ₹2,999</p>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
