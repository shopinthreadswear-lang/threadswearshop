"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Overview", area: "dashboard" },
  { href: "/admin/orders", label: "Orders", area: "orders" },
  { href: "/admin/products", label: "Products", area: "products" },
  { href: "/admin/content", label: "Site content", area: "content" },
  { href: "/admin/offers", label: "Offers", area: "offers" },
  { href: "/admin/coupons", label: "Coupons", area: "coupons" },
  { href: "/admin/customers", label: "Customers", area: "customers" },
  { href: "/admin/reviews", label: "Reviews", area: "reviews" },
  { href: "/admin/returns", label: "Returns", area: "returns" },
  { href: "/admin/inbox", label: "Inbox", area: "inbox" },
  { href: "/admin/settings", label: "Settings", area: "settings" },
  { href: "/admin/team", label: "Team", area: "team" },
  { href: "/admin/activity", label: "Activity log", area: "activity" },
];

export function AdminNav({ badges, allowed }: { badges: Record<string, number>; allowed: string[] }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  return (
    <nav aria-label="Admin" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
      {LINKS.filter((l) => allowed.includes(l.area)).map((l) => (
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
