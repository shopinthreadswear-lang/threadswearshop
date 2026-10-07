import type { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export type PolicySection = { id: string; title: string; body: ReactNode };

export function PolicyPage({ eyebrow, title, intro, updated, sections, crumb, aside }: { eyebrow: string; title: string; intro: ReactNode; updated?: string; sections: PolicySection[]; crumb: string; aside?: ReactNode }) {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: crumb }]} className="mb-8" />
      <header className="max-w-3xl">
        <p className="eyebrow text-muted">{eyebrow}</p>
        <h1 className="display-lg mt-4">{title}</h1>
        <div className="mt-5 text-[15.5px] leading-relaxed text-muted">{intro}</div>
        {updated && <p className="mt-5 text-[12px] text-faint">Last updated {updated}</p>}
      </header>
      <div className="mt-14 grid gap-12 border-t border-line pt-12 lg:grid-cols-12">
        <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-[90px]">
            <p className="eyebrow mb-4 text-[10px] text-muted">On this page</p>
            <ul className="space-y-2 text-[13px]">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted link-u hover:text-ink">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
            {aside && <div className="mt-10">{aside}</div>}
          </div>
        </nav>
        <div className="prose-tw max-w-[var(--container-prose)] lg:col-span-8">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="!mt-0 pt-2 first:pt-0">{s.title}</h2>
              {s.body}
              <div className="mb-14" />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
