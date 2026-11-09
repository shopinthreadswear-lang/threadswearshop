import Link from "next/link";
import type { ReactNode } from "react";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const TONE: Record<string, string> = {
  new: "bg-ochre/20 text-[#7a4f0f]",
  info: "bg-burgundy/10 text-burgundy",
  good: "bg-success/12 text-success",
  muted: "bg-ink/8 text-muted",
  bad: "bg-error/10 text-error",
};

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: keyof typeof TONE }) {
  return <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-[11.5px] font-bold", TONE[tone])}>{children}</span>;
}

const ORDER_TONE: Record<OrderStatus, keyof typeof TONE> = {
  placed: "new",
  confirmed: "new",
  packed: "info",
  shipped: "info",
  out_for_delivery: "info",
  delivered: "good",
  cancelled: "muted",
  returned: "bad",
};

export function OrderPill({ status, label }: { status: OrderStatus; label: string }) {
  return <Pill tone={ORDER_TONE[status]}>{label}</Pill>;
}

export function PageHeader({ title, sub, action, back }: { title: string; sub?: ReactNode; action?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="hit mb-2 inline-block text-[12.5px] font-semibold text-muted hover:text-burgundy">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-serif text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight tracking-[-0.02em] text-ink">{title}</h1>
        {sub && <p className="mt-1.5 text-[14px] text-muted">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({ title, action, children, className, pad = true }: { title?: string; action?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cn("rounded-card border border-line bg-paper", pad && "p-5 md:p-6", className)}>
      {(title || action) && (
        <div className={cn("mb-4 flex items-center justify-between gap-3", !pad && "px-5 pt-5 md:px-6 md:pt-6")}>
          {title && <h2 className="text-[15px] font-bold text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, note, href }: { label: string; value: string; note?: string; href?: string }) {
  const body = (
    <>
      <p className="text-[12.5px] font-semibold text-muted">{label}</p>
      <p className="mt-1.5 font-serif text-[26px] font-extrabold leading-none tracking-[-0.02em] text-ink">{value}</p>
      {note && <p className="mt-2 text-[12px] text-muted">{note}</p>}
    </>
  );
  const cls = "block rounded-card border border-line bg-paper p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-burgundy")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-5 py-14 text-center">
      <p className="text-[15px] font-bold text-ink">{title}</p>
      {children && <div className="mx-auto mt-1.5 max-w-sm text-[13.5px] text-muted">{children}</div>}
    </div>
  );
}

/** Pill-shaped filter links. */
export function Tabs({ items, current }: { items: { href: string; label: string; count?: number; key: string }[]; current: string }) {
  return (
    <nav aria-label="Filter" className="no-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1">
      {items.map((t) => (
        <Link key={t.key} href={t.href} aria-current={t.key === current ? "page" : undefined} className={cn("inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors", t.key === current ? "border-burgundy bg-burgundy text-cream" : "border-line bg-paper text-ink hover:border-burgundy")}>
          {t.label}
          {t.count !== undefined && <span className={cn("text-[11.5px]", t.key === current ? "text-cream/75" : "text-muted")}>{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export const th = "px-4 py-3 text-left text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted";
export const td = "px-4 py-3.5 align-middle text-[13.5px]";
