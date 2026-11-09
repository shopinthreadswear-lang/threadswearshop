import Image from "next/image";
import Link from "next/link";
import { getProductById } from "@/data/products";
import { fmtDate, getAdmin } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { Card, Empty, PageHeader, Pill, Tabs } from "@/components/admin/bits";
import { QuickAction } from "@/components/admin/forms";
import { moderateReview } from "@/app/admin/actions";

export const metadata = { title: "Reviews" };

const status = (s?: string) => s ?? "approved";
const TABS = [
  { key: "pending", label: "Waiting for approval" },
  { key: "approved", label: "Live" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await getAdmin("reviews");
  const { tab = "pending" } = await searchParams;
  const all = await read((db) => [...db.reviews].sort((a, b) => b.date.localeCompare(a.date)));
  const shown = all.filter((r) => tab === "all" || status(r.status) === tab);

  return (
    <>
      <PageHeader title="Reviews" sub="New reviews wait here until you approve them. Only approved reviews show on product pages." />
      <Tabs current={tab} items={TABS.map((t) => ({ ...t, href: `/admin/reviews?tab=${t.key}`, count: t.key === "all" ? all.length : all.filter((r) => status(r.status) === t.key).length }))} />
      {shown.length ? (
        <ul className="space-y-3">
          {shown.map((r) => {
            const p = getProductById(r.productId);
            const st = status(r.status);
            return (
              <li key={r.id}>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] text-ochre" role="img" aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></p>
                      <h3 className="mt-1 text-[15px] font-bold text-ink">{r.title}</h3>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {r.author}{r.location ? `, ${r.location}` : ""} · {fmtDate(r.date)} · size {r.sizePurchased} · {r.fit}
                        {p && <> · <Link href={`/products/${p.slug}`} target="_blank" className="font-semibold text-burgundy hover:underline">{p.name} ↗</Link></>}
                      </p>
                    </div>
                    <span className="flex gap-1.5">
                      {r.verified && <Pill tone="good">Verified buyer</Pill>}
                      <Pill tone={st === "pending" ? "new" : st === "approved" ? "info" : "bad"}>{st === "pending" ? "Waiting" : st === "approved" ? "Live" : "Rejected"}</Pill>
                    </span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-ink">{r.body}</p>
                  {!!r.images?.length && (
                    <div className="mt-3 flex gap-2">
                      {r.images.map((src, i) => (
                        <span key={i} className="relative h-20 w-20 overflow-hidden rounded-[10px] bg-bone">
                          <Image src={src} alt={`Customer photo ${i + 1}`} fill sizes="80px" className="object-cover" unoptimized />
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                    {st !== "approved" && <QuickAction action={moderateReview} fields={{ reviewId: r.id, op: "approve" }} label="Approve" />}
                    {st !== "rejected" && <QuickAction action={moderateReview} fields={{ reviewId: r.id, op: "reject" }} label={st === "approved" ? "Take down" : "Reject"} />}
                    <QuickAction action={moderateReview} fields={{ reviewId: r.id, op: "delete" }} label="Delete" tone="danger" confirm="Delete this review for good?" />
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : (
        <Card pad={false}>
          <Empty title={tab === "pending" ? "All caught up" : "No reviews here"}>{tab === "pending" ? "New reviews from customers will wait here for you." : "Reviews in this state will show up here."}</Empty>
        </Card>
      )}
    </>
  );
}
