import { getProductById } from "@/data/products";
import { fmtDate } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { Card, Empty, PageHeader, Pill, Tabs } from "@/components/admin/bits";
import { QuickAction } from "@/components/admin/forms";
import { deleteMessage } from "@/app/admin/actions";

export const metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "messages" } = await searchParams;
  const d = await read((db) => ({
    messages: [...db.contactMessages].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    subscribers: [...db.newsletter].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    alerts: [...db.stockAlerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }));

  return (
    <>
      <PageHeader title="Inbox" sub="Contact-form messages, newsletter sign-ups and back-in-stock requests." />
      <Tabs
        current={tab}
        items={[
          { key: "messages", label: "Messages", href: "/admin/inbox?tab=messages", count: d.messages.length },
          { key: "subscribers", label: "Newsletter", href: "/admin/inbox?tab=subscribers", count: d.subscribers.length },
          { key: "alerts", label: "Back in stock", href: "/admin/inbox?tab=alerts", count: d.alerts.length },
        ]}
      />
      {tab === "subscribers" ? (
        <Card pad={false} title={`${d.subscribers.length} subscribers`} action={d.subscribers.length ? <a href="/admin/subscribers.csv" className="btn btn-outline btn-sm" download>Download CSV</a> : undefined}>
          {d.subscribers.length ? (
            <ul className="divide-y divide-line border-t border-line">
              {d.subscribers.map((s) => (
                <li key={s.email} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[13.5px]">
                  <a href={`mailto:${s.email}`} className="font-semibold text-ink hover:text-burgundy">{s.email}</a>
                  <span className="text-[12.5px] text-muted">{s.source} · {fmtDate(s.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No sign-ups yet" />
          )}
        </Card>
      ) : tab === "alerts" ? (
        <Card pad={false}>
          {d.alerts.length ? (
            <ul className="divide-y divide-line">
              {d.alerts.map((a, n) => (
                <li key={n} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-[13.5px]">
                  <span><b className="font-semibold">{getProductById(a.productId)?.name ?? a.productId}</b> <span className="text-muted">· {a.color} · {a.size}</span></span>
                  <span className="text-[12.5px] text-muted">{a.contact} · {fmtDate(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No requests yet">When a customer asks to be told about a sold-out size, it’s listed here — restock it under Products.</Empty>
          )}
        </Card>
      ) : (
        <Card pad={false}>
          {d.messages.length ? (
            <ul className="divide-y divide-line">
              {d.messages.map((m) => (
                <li key={m.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-ink">{m.name} <Pill>{m.topic}</Pill>{m.orderNumber && <Pill tone="info">{m.orderNumber}</Pill>}</p>
                      <p className="mt-0.5 text-[12.5px] text-muted"><a href={`mailto:${m.email}`} className="hover:text-burgundy">{m.email}</a>{m.phone ? ` · ${m.phone}` : ""} · {fmtDate(m.createdAt, true)}</p>
                    </div>
                    <span className="flex gap-2">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`} className="inline-flex h-9 items-center rounded-full bg-burgundy px-4 text-[12px] font-semibold text-cream hover:bg-burgundy-deep">Reply</a>
                      <QuickAction action={deleteMessage} fields={{ id: m.id }} label="Done" confirm="Remove this message from the inbox?" />
                    </span>
                  </div>
                  <p className="mt-2 max-w-prose whitespace-pre-line text-[13.5px] leading-relaxed text-ink">{m.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Inbox zero">Messages from the contact page land here.</Empty>
          )}
        </Card>
      )}
    </>
  );
}
