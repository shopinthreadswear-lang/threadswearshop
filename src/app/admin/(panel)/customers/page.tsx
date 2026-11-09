import Link from "next/link";
import { getAdmin } from "@/lib/server/admin";
import { fmtDate } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, Empty, PageHeader, Pill, td, th } from "@/components/admin/bits";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await getAdmin("customers");
  const { q = "" } = await searchParams;
  const rows = await read((db) =>
    db.users
      .map((u) => {
        const orders = db.orders.filter((o) => o.userId === u.id && o.status !== "cancelled");
        return { u, orders: orders.length, spent: orders.reduce((a, o) => a + o.totals.total, 0), last: orders[0]?.createdAt, subscribed: u.preferences.newsletter };
      })
      .sort((a, b) => b.spent - a.spent),
  );
  const term = q.trim().toLowerCase();
  const shown = rows.filter((r) => !term || `${r.u.firstName} ${r.u.lastName} ${r.u.email} ${r.u.phone ?? ""}`.toLowerCase().includes(term));

  return (
    <>
      <PageHeader title="Customers" sub="People with an account, highest spend first. Guest orders are under Orders." />
      <form className="mb-4 flex gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search customers</label>
        <input id="q" name="q" defaultValue={q} placeholder="Name, email or phone" className="field h-11 min-w-0 max-w-md flex-1 rounded-full px-5" />
        <button className="btn btn-outline btn-sm">Search</button>
      </form>
      <Card pad={false}>
        {shown.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Customer</th>
                  <th className={th}>Joined</th>
                  <th className={th}>Orders</th>
                  <th className={th}>Last order</th>
                  <th className={`${th} text-right`}>Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map(({ u, orders, spent, last, subscribed }) => (
                  <tr key={u.id}>
                    <td className={td}>
                      <Link href={`/admin/customers/${u.id}`} className="flex items-center gap-2 font-semibold hover:text-burgundy">{u.firstName} {u.lastName}{subscribed && <Pill tone="info">Newsletter</Pill>}{u.blocked && <Pill tone="bad">Blocked</Pill>}</Link>
                      <a href={`mailto:${u.email}`} className="block text-[12.5px] text-muted hover:text-burgundy">{u.email}</a>
                      {u.phone && <span className="block text-[12.5px] text-muted">{u.phone}</span>}
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{fmtDate(u.createdAt)}</td>
                    <td className={td}>{orders ? <Link href={`/admin/orders?q=${encodeURIComponent(u.email)}`} className="font-semibold text-burgundy hover:underline">{orders}</Link> : <span className="text-muted">0</span>}</td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{last ? fmtDate(last) : "—"}</td>
                    <td className={`${td} text-right font-semibold`}>{formatINR(spent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={term ? `No one matches “${q}”` : "No customers yet"} />
        )}
      </Card>
    </>
  );
}
