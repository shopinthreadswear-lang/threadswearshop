import Link from "next/link";
import { notFound } from "next/navigation";
import { fmtDate, getAdmin, STATUS_LABEL } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, Empty, OrderPill, PageHeader, Pill, Stat, td, th } from "@/components/admin/bits";
import { BlockForm } from "./BlockForm";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await getAdmin("customers");
  const { id } = await params;
  const data = await read((db) => {
    const u = db.users.find((x) => x.id === id);
    if (!u) return null;
    const orders = db.orders.filter((o) => o.userId === u.id || o.email.toLowerCase() === u.email.toLowerCase()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const counted = orders.filter((o) => o.status !== "cancelled");
    const refunded = orders.reduce((a, o) => a + (o.refunds ?? []).reduce((x, r) => x + r.amount, 0), 0);
    const { passwordHash: _p, payments: _c, ...user } = u;
    void _p;
    void _c;
    return {
      user,
      orders,
      spent: counted.reduce((a, o) => a + o.totals.total, 0) - refunded,
      count: counted.length,
      returns: db.returns.filter((r) => orders.some((o) => o.id === r.orderId)).length,
    };
  });
  if (!data) notFound();
  const { user: u, orders, spent, count } = data;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/customers", label: "Customers" }}
        title={`${u.firstName} ${u.lastName}`}
        sub={<>Customer since {fmtDate(u.createdAt)}{u.blocked ? <> · <span className="font-semibold text-error">Blocked</span></> : null}</>}
      />
      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Total spent" value={formatINR(spent)} note="after refunds, excl. cancelled" />
        <Stat label="Orders" value={String(count)} note={orders.length > count ? `${orders.length - count} cancelled` : "none cancelled"} />
        <Stat label="Average order" value={formatINR(count ? Math.round(spent / count) : 0)} />
        <Stat label="Returns" value={String(data.returns)} />
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title="Order history" pad={false}>
          {orders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="border-b border-line">
                  <tr><th className={th}>Order</th><th className={th}>Date</th><th className={th}>Status</th><th className={`${th} text-right`}>Total</th></tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-bold text-ink hover:text-burgundy">{o.id}</Link></td>
                      <td className={`${td} whitespace-nowrap text-muted`}>{fmtDate(o.createdAt)}</td>
                      <td className={td}><OrderPill status={o.status} label={STATUS_LABEL[o.status]} /></td>
                      <td className={`${td} text-right font-semibold`}>{formatINR(o.totals.total)}{o.refunds?.length ? <span className="block text-[11.5px] text-error">refunded</span> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No orders yet" />
          )}
        </Card>

        <div className="space-y-4">
          <Card title="Contact">
            <p className="text-[13.5px]"><a href={`mailto:${u.email}`} className="text-burgundy hover:underline">{u.email}</a></p>
            {u.phone && <p className="text-[13.5px]"><a href={`tel:${u.phone}`} className="text-burgundy hover:underline">{u.phone}</a></p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {u.preferences.newsletter && <Pill tone="info">Newsletter</Pill>}
              {u.preferences.whatsapp && <Pill tone="info">WhatsApp updates</Pill>}
              {u.preferences.preferredSize && <Pill>Size {u.preferences.preferredSize}</Pill>}
              <Pill>{u.wishlist.length} in wishlist</Pill>
            </div>
          </Card>
          <Card title={`Addresses (${u.addresses.length})`}>
            {u.addresses.length ? (
              <ul className="space-y-3">
                {u.addresses.map((a) => (
                  <li key={a.id} className="text-[13px] leading-relaxed">
                    <span className="font-semibold">{a.label}{a.isDefault ? " · default" : ""}</span><br />
                    {a.fullName}, {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-muted">No saved addresses.</p>
            )}
          </Card>
          <Card title={u.blocked ? "Blocked" : "Block this customer"}>
            {u.blocked && <p className="mb-3 rounded-chip bg-error/10 px-3 py-2 text-[12.5px] text-error">Blocked {fmtDate(u.blocked.at, true)} · {u.blocked.reason}</p>}
            <BlockForm userId={u.id} blocked={!!u.blocked} />
          </Card>
        </div>
      </div>
    </>
  );
}
