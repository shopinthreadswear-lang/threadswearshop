import { articles } from "@/data/journal";
import { JournalCard } from "@/components/editorial/JournalCard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Reveal } from "@/components/ui/Reveal";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "The Journal — Style Editorial", description: "Style guides, fit advice and stories from the Threads Ware studio. How to layer, how to wear an oxford shirt, and the essentials every man should own.", path: "/journal" });

export default function JournalPage() {
  const [lead, ...rest] = articles;
  const categories = Array.from(new Set(articles.map((a) => a.category)));
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Journal" }]} className="mb-8" />
      <header className="flex flex-col justify-between gap-6 border-b border-line pb-10 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-muted">The Threads Ware Journal</p>
          <h1 className="display-xl mt-4">Style, considered.</h1>
        </div>
        <ul className="flex flex-wrap gap-2 text-[12px]">
          {categories.map((c) => (
            <li key={c} className="border border-line px-3 py-1.5 text-muted">{c}</li>
          ))}
        </ul>
      </header>
      <Reveal className="mt-14">
        <div className="grid items-end gap-10 md:grid-cols-2">
          <JournalCard article={lead} large />
        </div>
      </Reveal>
      <div className="mt-20 grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {rest.map((a, i) => (
          <Reveal key={a.slug} delay={(i % 3) * 80}>
            <JournalCard article={a} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
