import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "./Icons";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "light" | "ghost-light";

export function CTA({ href, children, variant = "primary", className, arrow = true, size }: { href: string; children: ReactNode; variant?: Variant; className?: string; arrow?: boolean; size?: "sm" }) {
  return (
    <Link href={href} className={cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", className)}>
      <span>{children}</span>
      {arrow && <ArrowRight className="btn-arrow" size={15} />}
    </Link>
  );
}

export function TextLink({ href, children, className, light }: { href: string; children: ReactNode; className?: string; light?: boolean }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-3 label-sm", light ? "text-ivory" : "text-ink", className)}>
      <span className="link-u pb-1 [background-size:100%_1px] group-hover:[background-size:0%_1px] group-hover:[background-position:100%_100%]">{children}</span>
      <ArrowRight size={14} className="transition-transform duration-500 ease-[var(--ease-lux)] group-hover:translate-x-1" />
    </Link>
  );
}
