import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Tile = { eyebrow?: string; title: React.ReactNode; href: string; img: string; alt: string; focus?: string; imgBox: string; className: string; align?: "right" };

/** A tile of colour holding a line of type, one small white button and a photo that takes up the rest of the space. */
function PromoTile({ t }: { t: Tile }) {
  return (
    <Link href={t.href} className={cn("group relative block overflow-hidden", t.className)}>
      <div className={cn("absolute", t.imgBox)}>
        <Image src={t.img} alt={t.alt} fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover transition-transform duration-700 ease-[var(--ease-lux)] group-hover:scale-[1.04]" style={{ objectPosition: t.focus }} />
      </div>
      <div className={cn("relative p-5 md:p-6 lg:p-8", t.align === "right" && "text-right")}>
        {t.eyebrow && <p className="text-[12px] text-muted">{t.eyebrow}</p>}
        <h3 className="mt-1.5 max-w-[15ch] font-serif [.text-right_&]:max-w-[9ch] text-[clamp(1.35rem,2.1vw,1.9rem)] font-medium leading-[1.18] text-ink [.text-right_&]:ml-auto">{t.title}</h3>
        <span className="mt-5 inline-flex h-10 items-center bg-cream px-5 text-[13px] font-medium text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-cream">Shop Now</span>
      </div>
    </Link>
  );
}

/** Four promotional tiles: one tall, one wide, one square and a solid-colour sale tile. */
export function PromoMosaic({ tiles, sale }: { tiles: [Tile, Tile, Tile]; sale: { percent: number; href: string } }) {
  const [tall, wide, square] = tiles;
  return (
    <section aria-label="Shop by edit" className="pb-16 md:pb-20">
      <div className="container-site grid gap-1.5 md:grid-cols-12 md:gap-2">
        <PromoTile t={{ ...tall, className: cn(tall.className, "min-h-[460px] md:col-span-5 md:row-span-2 md:min-h-[620px]") }} />
        <PromoTile t={{ ...wide, className: cn(wide.className, "min-h-[280px] md:col-span-7 md:min-h-[306px]") }} />
        <PromoTile t={{ ...square, className: cn(square.className, "min-h-[280px] md:col-span-4 md:min-h-[306px]") }} />
        <Link href={sale.href} className="group flex min-h-[260px] flex-col items-center justify-center bg-denim p-6 text-center text-cream md:col-span-3">
          <p className="font-serif text-[clamp(1.05rem,1.4vw,1.3rem)] font-medium leading-snug">The Archive Sale, up to</p>
          <p className="mt-1 font-serif text-[clamp(3.2rem,5.4vw,5rem)] font-semibold leading-none">
            {sale.percent}
            <span className="align-[0.18em] text-[0.56em]">%</span>
          </p>
          <span className="mt-5 inline-flex h-10 items-center bg-cream px-5 text-[13px] font-medium text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-cream">Shop Now</span>
        </Link>
      </div>
    </section>
  );
}
