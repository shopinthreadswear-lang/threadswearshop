import Link from "next/link";
import { fmtDate, getAdmin, ROLE_LABEL, type Area } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { Card, Empty, PageHeader, Pill, Tabs } from "@/components/admin/bits";

export const metadata = { title: "Activity log" };

const AREA_LABEL: Partial<Record<Area, string>> = { orders: "Orders", products: "Products", content: "Site content", offers: "Offers", coupons: "Coupons", customers: "Customers", reviews: "Reviews", returns: "Returns", inbox: "Inbox", settings: "Settings", team: "Team & sign-ins" };
const PAGE = 100;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ area?: string; who?: string; page?: string }> }) {
  await getAdmin("activity");
  const { area = "all", who = "", page = "1" } = await searchParams;
  const all = await read((db) => db.audit ?? []);
  const people = [...new Map(all.map((e) => [e.actor.id, e.actor])).values()];
  const list = all.filter((e) => (area === "all" || e.area === area) && (!who || e.actor.id === who));
  const n = Math.max(1, Number(page) || 1);
  const shown = list.slice((n - 1) * PAGE, n * PAGE);
  const q = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ ...(area !== "all" ? { area } : {}), ...(who ? { who } : {}), ...patch });
    for (const [k, v] of [...p]) if (!v || v === "all") p.delete(k);
    return `/admin/activity${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Activity log" sub="Every change made in the admin: who, what and when. The latest 1,000 are kept." />
      <Tabs current={area} items={[{ key: "all", label: "Everything", href: q({ area: "all", page: "" }) }, ...Object.entries(AREA_LABEL).map(([k, label]) => ({ key: k, label: label!, href: q({ area: k, page: "" }) }))]} />
      {people.length > 1 && (
        <nav aria-label="Filter by person" className="-mt-2 mb-4 flex flex-wrap gap-2 text-[12.5px]">
          <Link href={q({ who: "", page: "" })} className={!who ? "font-bold text-burgundy" : "text-muted hover:text-ink"}>Everyone</Link>
          {people.map((p) => (
            <Link key={p.id} href={q({ who: p.id, page: "" })} className={who === p.id ? "font-bold text-burgundy" : "text-muted hover:text-ink"}>{p.name}</Link>
          ))}
        </nav>
      )}
      <Card pad={false}>
        {shown.length ? (
          <ul className="divide-y divide-line">
            {shown.map((e) => (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 px-5 py-3">
                <time dateTime={e.at} className="w-[150px] shrink-0 text-[12px] text-muted">{fmtDate(e.at, true)}</time>
                <span className="min-w-0 flex-1 text-[13.5px] text-ink">
                  {e.href ? <Link href={e.href} className="hover:text-burgundy hover:underline">{e.action}</Link> : e.action}
                </span>
                <span className="flex items-center gap-2 text-[12.5px] text-muted">
                  {e.actor.name} <Pill>{ROLE_LABEL[e.actor.role]}</Pill>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Nothing here yet">Changes made in the admin will show up here.</Empty>
        )}
      </Card>
      {list.length > PAGE && (
        <div className="mt-4 flex justify-between text-[13px] font-semibold">
          {n > 1 ? <Link href={q({ page: String(n - 1) })} className="text-burgundy">← Newer</Link> : <span />}
          {n * PAGE < list.length ? <Link href={q({ page: String(n + 1) })} className="text-burgundy">Older →</Link> : <span />}
        </div>
      )}
    </>
  );
}
