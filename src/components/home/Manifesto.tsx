import Link from "next/link";
import { Draggable, SpringHeading } from "@/components/motion/Scroll";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

/** Pills stuck over the headline like stickers on a poster — they can be picked up and moved with a mouse. */
const PILLS = [
  { label: "Heavyweight Tees", href: "/men/t-shirts", cls: "bg-acid text-ink", pos: "left-[24%] top-[20%] -rotate-[4deg]" },
  { label: "Oxford Shirts", href: "/men/shirts", cls: "bg-sky text-ink", pos: "right-[14%] top-[46%] rotate-[3deg]" },
  { label: "Tailoring", href: "/men/designer-wear", cls: "bg-tomato text-cream", pos: "left-[28%] top-[71%] rotate-[-2deg]" },
];

/** "About" manifesto: one enormous condensed headline, three sticker pills, and a cheeky aside. */
export function Manifesto() {
  return (
    <section aria-labelledby="manifesto-title" className="relative overflow-x-clip pb-24 pt-28 md:pb-32 md:pt-40">
      <div className="container-site text-center">
        <p className="eyebrow text-muted">About Threads Ware</p>
        <div className="relative mx-auto mt-6 max-w-[1180px]">
          <SpringHeading
            id="manifesto-title"
            className="font-serif text-[clamp(2.9rem,8.6vw,8.6rem)] font-extrabold leading-[0.86] tracking-[-0.025em] text-ink [font-variation-settings:'wdth'_75,'opsz'_96]"
            parts={["We Cut Daring Shirts, Eye-Popping Tees & Tailoring That Makes Noise"]}
          />
          {PILLS.map((p, i) => (
            <div key={p.label} className={cn("absolute z-10 hidden md:block", p.pos)} style={{ animation: `fade-up 700ms var(--ease-lux) ${600 + i * 140}ms both` }}>
              <Draggable shadow={false}>
                <Link href={p.href} className={cn("inline-flex items-center rounded-full border-[1.5px] border-ink px-4 py-1.5 text-[13px] font-bold shadow-[3px_3px_0_var(--color-ink)] transition-transform duration-300 hover:-translate-y-0.5", p.cls)}>
                  {p.label}
                </Link>
              </Draggable>
            </div>
          ))}
        </div>
        {/* Phones: the pills sit under the headline instead of over it */}
        <ul className="mt-7 flex flex-wrap justify-center gap-2.5 md:hidden">
          {PILLS.map((p) => (
            <li key={p.label}>
              <Link href={p.href} className={cn("inline-flex min-h-10 items-center rounded-full border-[1.5px] border-ink px-4 text-[13px] font-bold shadow-[3px_3px_0_var(--color-ink)]", p.cls)}>
                {p.label}
              </Link>
            </li>
          ))}
        </ul>

        <Reveal delay={150}>
          <p className="mt-10 font-serif text-[clamp(1.4rem,2.4vw,2rem)] font-bold italic text-ink [font-variation-settings:'wdth'_85]">(because plain is boring)</p>
          <p className="mx-auto mt-8 max-w-xl text-[14.5px] leading-[1.75] text-muted">
            Threads Ware started with one T-shirt that refused to lose its shape. Today we cut heavyweight tees, oxford and linen shirts, knitwear and half-canvassed tailoring in small runs in Mumbai — clothes with a bit of nerve, made to be worn hard and kept for years.
          </p>
          <Link href="/shop" className="btn btn-olive btn-sm mt-9">
            Shop the edit <ArrowRight size={14} className="btn-arrow" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
