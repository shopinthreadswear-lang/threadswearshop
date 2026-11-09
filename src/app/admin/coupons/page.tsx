import { coupons, usable } from "@/lib/server/promos";
import { fmtDate } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, Empty, PageHeader, Pill } from "@/components/admin/bits";
import { QuickAction } from "@/components/admin/forms";
import { deleteCoupon, toggleCoupon } from "@/app/admin/actions";
import { CouponForm } from "./CouponForm";

export const metadata = { title: "Coupons" };

export default async function CouponsPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const list = await read((db) => coupons(db).map((c) => ({ ...c })));
  const editing = list.find((c) => c.id === edit);

  return (
    <>
      <PageHeader title="Coupon codes" sub="Codes customers type at checkout. Changes apply to the next order." />
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title={`${list.length} ${list.length === 1 ? "code" : "codes"}`} pad={false}>
          {list.length ? (
            <ul className="divide-y divide-line border-t border-line">
              {list.map((c) => {
                const live = usable(c);
                const why = !c.active ? "Paused" : c.usageLimit && c.used >= c.usageLimit ? "Used up" : "Expired";
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <code className="rounded-[8px] bg-bone px-2 py-0.5 font-mono text-[13px] font-bold tracking-[0.06em] text-ink">{c.code}</code>
                        {live ? <Pill tone="good">Active</Pill> : <Pill>{why}</Pill>}
                      </span>
                      <span className="mt-1 block text-[12.5px] text-muted">
                        {c.type === "percent" ? `${c.value}% off` : `${formatINR(c.value)} off`}
                        {c.minSubtotal ? ` · orders over ${formatINR(c.minSubtotal)}` : ""}
                        {` · used ${c.used}${c.usageLimit ? ` of ${c.usageLimit}` : ""}`}
                        {c.expires ? ` · until ${fmtDate(c.expires)}` : ""}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-2">
                      <a href={`/admin/coupons?edit=${c.id}`} className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-[12px] font-semibold text-ink transition-colors hover:border-burgundy hover:text-burgundy">Edit</a>
                      <QuickAction action={toggleCoupon} fields={{ couponId: c.id }} label={c.active ? "Pause" : "Activate"} />
                      <QuickAction action={deleteCoupon} fields={{ couponId: c.id }} label="Delete" tone="danger" confirm={`Delete ${c.code}? Customers won’t be able to use it.`} />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="No codes yet">Create your first one, like WELCOME10 for 10% off a first order.</Empty>
          )}
        </Card>
        <Card title={editing ? `Edit ${editing.code}` : "New code"} action={editing ? <a href="/admin/coupons" className="text-[13px] font-semibold text-muted hover:text-burgundy">Cancel</a> : undefined}>
          <CouponForm key={editing?.id ?? "new"} coupon={editing} />
        </Card>
      </div>
    </>
  );
}
