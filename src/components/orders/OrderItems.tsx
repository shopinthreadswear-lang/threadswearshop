import Image from "next/image";
import Link from "next/link";
import type { OrderItem } from "@/lib/types";
import { formatINR } from "@/lib/site";

export function OrderItems({ items }: { items: OrderItem[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {items.map((i) => (
        <li key={i.sku + i.size} className="flex gap-4 py-5">
          <Link href={i.productId === "gift-card" ? "/gift-cards" : `/products/${i.slug}`} className="relative h-28 w-[84px] shrink-0 overflow-hidden bg-bone">
            <Image src={i.image} alt={i.name} fill sizes="84px" className="img-grade object-cover" />
          </Link>
          <div className="flex-1 text-[13.5px]">
            <p>{i.name}</p>
            <p className="mt-1 text-muted">
              {i.color} · {i.size} · Qty {i.quantity}
            </p>
            <p className="mt-1 text-[11.5px] text-faint">{i.sku}</p>
          </div>
          <p className="text-[13.5px]">{formatINR(i.lineTotal)}</p>
        </li>
      ))}
    </ul>
  );
}
