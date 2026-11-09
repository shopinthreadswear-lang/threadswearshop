import Link from "next/link";
import { getAdmin } from "@/lib/server/admin";
import { fmtDate } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { Card, Empty, PageHeader, Pill } from "@/components/admin/bits";
import { ReturnStep } from "./ReturnStep";

export const metadata = { title: "Returns" };

const LABEL = { requested: "Requested", approved: "Approved", picked_up: "Picked up", refunded: "Refunded", exchanged: "Exchanged" } as const;
const NEXT = { requested: ["approved"], approved: ["picked_up"], picked_up: ["refunded", "exchanged"], refunded: [], exchanged: [] } as const;

export default async function ReturnsPage() {
  await getAdmin("returns");
  const list = await read((db) => [...db.returns].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  return (
    <>
      <PageHeader title="Returns & exchanges" sub="Approve, arrange pickup, then refund or send the new size." />
      <Card pad={false}>
        {list.length ? (
          <ul className="divide-y divide-line">
            {list.map((r) => (
              <li key={r.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/orders/${r.orderId}`} className="text-[14px] font-bold text-ink hover:text-burgundy">{r.orderId}</Link>
                    <Pill tone={r.status === "requested" ? "new" : r.status === "refunded" || r.status === "exchanged" ? "good" : "info"}>{LABEL[r.status]}</Pill>
                    <Pill>{r.resolution === "exchange" ? `Exchange${r.exchangeSize ? ` → ${r.exchangeSize}` : ""}` : "Refund"}</Pill>
                  </p>
                  <p className="mt-1 text-[13px] text-ink">{r.items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">“{r.reason}”{r.details ? ` — ${r.details}` : ""} · {fmtDate(r.createdAt)}</p>
                </div>
                {NEXT[r.status].length > 0 && <ReturnStep returnId={r.id} options={NEXT[r.status].map((s) => ({ value: s, label: LABEL[s] }))} />}
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="No returns yet">When a customer starts a return from their account or the returns page, it shows up here.</Empty>
        )}
      </Card>
    </>
  );
}
