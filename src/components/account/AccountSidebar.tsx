"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/components/providers/StoreProvider";
import { cn } from "@/lib/cn";

const LINKS = [
  ["Overview", "/account"],
  ["Orders", "/account/orders"],
  ["Wishlist", "/account/wishlist"],
  ["Addresses", "/account/addresses"],
  ["Profile", "/account/profile"],
  ["Payment Methods", "/account/payments"],
  ["Preferences", "/account/preferences"],
  ["Returns & Exchanges", "/returns/request"],
];

export function AccountSidebar({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setUser } = useStore();
  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    router.push("/");
    router.refresh();
  };
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-[90px]">
      <p className="eyebrow text-muted">My Account</p>
      <p className="mt-3 font-serif text-[26px] leading-tight">{name}</p>
      <p className="mt-1 truncate text-[12.5px] text-muted">{email}</p>
      <ul className="no-scrollbar -mx-[var(--spacing-gutter)] mt-8 flex gap-2 overflow-x-auto px-[var(--spacing-gutter)] lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0">
        {LINKS.map(([l, h]) => {
          const active = h === "/account" ? pathname === h : pathname.startsWith(h);
          return (
            <li key={h} className="shrink-0">
              <Link href={h} aria-current={active ? "page" : undefined} className={cn("block whitespace-nowrap border px-4 py-2 text-[13px] transition-colors lg:border-0 lg:border-l lg:px-4 lg:py-2", active ? "border-ink text-ink lg:border-ink" : "border-line text-muted hover:text-ink lg:border-transparent")}>
                {l}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <button type="button" onClick={logout} className="block whitespace-nowrap border border-line px-4 py-2 text-left text-[13px] text-muted hover:text-ink lg:mt-6 lg:border-0 lg:border-l lg:border-transparent">
            Sign Out
          </button>
        </li>
      </ul>
    </nav>
  );
}
