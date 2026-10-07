import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { Eyebrow } from "@/components/motion/Eyebrow";
import { cn } from "@/lib/cn";

export function SectionHeading({ eyebrow, title, intro, action, className, light, align = "split" }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; action?: ReactNode; className?: string; light?: boolean; align?: "split" | "center" }) {
  if (align === "center")
    return (
      <Reveal className={cn("mx-auto mb-12 max-w-2xl text-center md:mb-16", className)}>
        {eyebrow && <Eyebrow light={light} center className="mb-5">{eyebrow}</Eyebrow>}
        <h2 className="display-md">{title}</h2>
        {intro && <p className={cn("mt-5 text-[15.5px] leading-relaxed", light ? "text-ivory/70" : "text-muted")}>{intro}</p>}
        {action && <div className="mt-8">{action}</div>}
      </Reveal>
    );
  return (
    <Reveal className={cn("mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow light={light} className="mb-4">{eyebrow}</Eyebrow>}
        <h2 className="display-md">{title}</h2>
        {intro && <p className={cn("mt-4 max-w-xl text-[15px] leading-relaxed", light ? "text-ivory/70" : "text-muted")}>{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
