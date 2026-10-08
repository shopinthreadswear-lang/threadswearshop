"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { faqs } from "@/data/faq";
import { AccordionItem } from "@/components/ui/Accordion";
import { SearchIcon } from "@/components/ui/Icons";

export function FaqView() {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return faqs;
    return faqs.map((c) => ({ ...c, items: c.items.filter((i) => `${i.q} ${i.a}`.toLowerCase().includes(t)) })).filter((c) => c.items.length);
  }, [q]);
  const count = filtered.reduce((a, c) => a + c.items.length, 0);
  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <div className="lg:sticky lg:top-[90px]">
          <label htmlFor="faq-q" className="sr-only">Search FAQs</label>
          <div className="flex items-center gap-3 border-b border-ink pb-3">
            <SearchIcon size={18} />
            <input id="faq-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions" className="h-11 w-full bg-transparent text-[16px] focus:outline-none" />
          </div>
          <nav aria-label="FAQ categories" className="mt-8">
            <ul className="flex flex-wrap gap-2 lg:block lg:space-y-2">
              {faqs.map((c) => (
                <li key={c.category}>
                  <a href={`#${c.category.toLowerCase()}`} className="flex min-h-11 items-center rounded-full border border-line px-4 text-[13px] text-muted hover:text-ink lg:block lg:min-h-0 lg:rounded-none lg:border-0 lg:p-0 lg:py-1">
                    {c.category}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      <div className="lg:col-span-8 lg:col-start-5" aria-live="polite">
        {q && <p className="mb-6 text-[13px] text-muted">{count} {count === 1 ? "answer" : "answers"} for “{q}”</p>}
        {filtered.map((c) => (
          <section key={c.category} id={c.category.toLowerCase()} className="mb-14 scroll-mt-28">
            <h2 className="display-sm mb-4">{c.category}</h2>
            <div className="border-t border-line">
              {c.items.map((i) => (
                <AccordionItem key={i.q} title={<span className="font-sans text-[14.5px] normal-case tracking-normal">{i.q}</span>} defaultOpen={!!q}>
                  {i.a}
                </AccordionItem>
              ))}
            </div>
          </section>
        ))}
        {!count && <p className="py-10 text-[14px] text-muted">No answers match that search.</p>}
        <div className="mt-6 bg-paper p-8">
          <p className="font-serif text-[24px]">Still have a question?</p>
          <p className="mt-2 text-[14px] text-muted">Our Customer Care team is here Monday to Saturday.</p>
          <Link href="/contact" className="btn btn-primary btn-sm mt-6">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
