import { emptyCatalog, deriveProducts, offerApplies } from "@/lib/catalog";
import { getAdmin } from "@/lib/server/admin";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import { fmtDate, hasEnded } from "@/lib/server/admin";
import { read } from "@/lib/server/store";
import { Card, Empty, PageHeader, Pill } from "@/components/admin/bits";
import { QuickAction } from "@/components/admin/forms";
import { deleteOffer, toggleOffer } from "@/app/admin/actions";
import { OfferForm } from "./OfferForm";

export const metadata = { title: "Offers" };

export default async function OffersPage() {
  await getAdmin("offers");
  const { offers, all } = await read((db) => {
    const state = db.catalog ?? emptyCatalog();
    return { offers: state.offers.map((o) => ({ ...o, expired: hasEnded(o.endsAt) })), all: deriveProducts({ ...state, offers: [] }) };
  });
  const scopes = [
    { value: "all", label: "Everything in the shop" },
    ...categories.map((c) => ({ value: `cat:${c.slug}`, label: `Category · ${c.name}` })),
    ...collections.map((c) => ({ value: `col:${c.slug}`, label: `Collection · ${c.name}` })),
  ];
  const scopeLabel = (s: string) => scopes.find((x) => x.value === s)?.label ?? s;
  return (
    <>
      <PageHeader title="Offers" sub="Put a whole category, collection or the entire shop on sale. Prices change straight away, with the old price crossed out." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card title="Your offers" pad={false}>
          {offers.length ? (
            <ul className="divide-y divide-line border-t border-line">
              {offers.map((o) => {
                const expired = o.expired;
                const count = all.filter((p) => offerApplies({ ...o, active: true, endsAt: undefined }, p) && !p.compareAtPrice).length;
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold text-ink">{o.name}</span>
                        {expired ? <Pill>Ended</Pill> : o.active ? <Pill tone="good">Live</Pill> : <Pill>Paused</Pill>}
                      </span>
                      <span className="mt-1 block text-[12.5px] text-muted">
                        {o.percent}% off · {scopeLabel(o.scope)} · {count} {count === 1 ? "piece" : "pieces"}{o.endsAt ? ` · ends ${fmtDate(o.endsAt)}` : ""}
                      </span>
                    </span>
                    <span className="flex gap-2">
                      {!expired && <QuickAction action={toggleOffer} fields={{ offerId: o.id }} label={o.active ? "Pause" : "Go live"} />}
                      <QuickAction action={deleteOffer} fields={{ offerId: o.id }} label="Delete" tone="danger" confirm={`Delete “${o.name}”? Prices go back to normal.`} />
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="No offers yet">Create one on the right — for example 20% off all shirts this weekend.</Empty>
          )}
          <p className="border-t border-line px-5 py-3 text-[12px] text-muted">Pieces that already have their own sale price keep it. When two offers overlap, the bigger discount wins.</p>
        </Card>
        <Card title="New offer">
          <OfferForm scopes={scopes} />
        </Card>
      </div>
    </>
  );
}
