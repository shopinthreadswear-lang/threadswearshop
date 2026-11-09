import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deriveProducts, emptyCatalog } from "@/lib/catalog";
import { availableStock, read } from "@/lib/server/store";
import { formatINR } from "@/lib/site";
import { Card, PageHeader, Pill } from "@/components/admin/bits";
import { QuickAction } from "@/components/admin/forms";
import { deleteCustomProduct, resetProduct } from "@/app/admin/actions";
import { ProductForm, StockRow } from "./ProductForms";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; reset?: string }> }) {
  const { id } = await params;
  const { created, reset } = await searchParams;
  const data = await read((db) => {
    const state = db.catalog ?? emptyCatalog();
    const p = deriveProducts(state, { includeHidden: true }).find((x) => x.id === id);
    // The same product without offers: these are the prices the admin actually sets.
    const own = deriveProducts({ ...state, offers: [] }, { includeHidden: true }).find((x) => x.id === id);
    if (!p || !own) return null;
    return {
      p,
      own,
      patch: state.products[id] ?? {},
      custom: state.custom.some((c) => c.id === id),
      edited: !!state.products[id],
      variants: p.variants.map((v) => ({ ...v, available: availableStock(db, v.sku, v.stock), sold: Math.max(0, db.inventoryAdjustments[v.sku] ?? 0) })),
    };
  });
  if (!data) notFound();
  const { p, own, patch, custom, edited, variants } = data;
  const onOffer = p.price !== own.price;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/products", label: "Products" }}
        title={p.name}
        sub={<>{p.subcategory} · {p.sku} · <Link href={`/products/${p.slug}`} target="_blank" className="font-semibold text-burgundy hover:underline">View in shop ↗</Link></>}
        action={
          custom ? (
            <QuickAction action={deleteCustomProduct} fields={{ productId: p.id }} label="Delete product" tone="danger" confirm="Delete this product for good? Past orders keep their details." />
          ) : edited ? (
            <QuickAction action={resetProduct} fields={{ productId: p.id }} label="Undo all my edits" confirm="Put this product back exactly as it was originally? Stock you set is reset too." />
          ) : undefined
        }
      />
      {(created || reset) && <p role="status" className="mb-4 rounded-chip bg-success/10 px-4 py-3 text-[13px] font-medium text-success">{created ? "Product added. It’s live in the shop — check the details and stock below." : "Back to the original details."}</p>}

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card title="Details">
          <ProductForm
            product={{ id: p.id, name: own.name, shortDescription: own.shortDescription, description: own.description, price: own.price, compareAtPrice: own.compareAtPrice, isNew: own.isNew, isBestSeller: own.isBestSeller, hidden: !!patch.hidden, badge: patch.badge ?? "auto" }}
            offerNote={onOffer ? `An offer is running on this piece, so customers pay ${formatINR(p.price)} instead of ${formatINR(own.price)}. Set your normal price below.` : undefined}
          />
        </Card>
        <div className="space-y-4">
          <Card title="Photos">
            <div className="grid grid-cols-3 gap-2">
              {p.images.slice(0, 6).map((src) => (
                <span key={src} className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-bone">
                  <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                </span>
              ))}
            </div>
          </Card>
          <Card title="In the shop">
            <div className="flex flex-wrap gap-1.5">
              {patch.hidden ? <Pill>Hidden</Pill> : <Pill tone="good">Visible</Pill>}
              {p.badge && <Pill tone="info">{p.badge}</Pill>}
              <Pill>{formatINR(p.price)}{p.compareAtPrice ? ` (was ${formatINR(p.compareAtPrice)})` : ""}</Pill>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Stock by colour and size" className="mt-4">
        <div id="stock" className="scroll-mt-24" />
        <p className="-mt-2 mb-4 text-[13px] text-muted">Type how many you have on the shelf now and press Save. New sales count down from that number.</p>
        <ul className="divide-y divide-line">
          {variants.map((v) => (
            <StockRow key={v.sku} productId={p.id} sku={v.sku} label={`${v.color} · ${v.size}`} available={v.available} />
          ))}
        </ul>
      </Card>
    </>
  );
}
