"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ badges }: { badges: Record<string, number> }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav aria-label="Admin" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={active(l.href) ? "page" : undefined}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-between gap-3 rounded-full px-4 text-[13.5px] font-semibold transition-colors lg:h-11 lg:rounded-chip",
            active(l.href) ? "bg-burgundy text-cream" : "text-ink hover:bg-bone",
          )}
        >
          {l.label}
          {!!badges[l.href] && <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold", active(l.href) ? "bg-cream text-burgundy" : "bg-burgundy text-cream")}>{badges[l.href]}</span>}
        </Link>
      ))}
    </nav>
  );
}
