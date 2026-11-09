import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { IMG } from "@/data/images";
import { cn } from "@/lib/cn";

const LOOKS = [
  { id: "weekend", label: "The Weekend Uniform", href: "/collections/weekend-uniform", img: IMG.manStripedOverDenim, alt: "Man in a denim overshirt over a striped tee", focus: "50% 25%", tone: "bg-espresso" },
  { id: "dark", label: "After Dark", href: "/collections/after-dark", img: IMG.manTweed, alt: "Man in a tweed jacket with a satchel", focus: "50% 40%", tone: "bg-burgundy" },
  { id: "wedding", label: "Wedding Season", href: "/collections/wedding-edit", img: IMG.manWaistcoat, alt: "Man in a navy waistcoat and tie", focus: "50% 25%", tone: "bg-ochre" },
];

/** "Looks that'll make you look good" — three outfits as tall cards, name in the corner and a Shop pill. */
export function LookCircles() {
  return (
    <section aria-labelledby="looks-title" className="py-20 md:py-28">
      <div className="container-site">
        <SectionTitle id="looks-title" title="Looks that’ll make you" accent="look good" sub="Three outfits, put together in the studio." />
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {LOOKS.map((l, i) => (
            <Reveal as="li" key={l.id} delay={i * 110}>
              <Link href={l.href} className={cn("lift group relative block aspect-[4/5] overflow-hidden rounded-[22px] md:aspect-[3/4.2]", l.tone)}>
                <Image src={l.img} alt={l.alt} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" style={{ objectPosition: l.focus }} />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/20" />
                <div className="absolute inset-x-0 top-0 p-6 text-cream md:p-7">
                  <h3 className="font-serif text-[26px] font-extrabold uppercase leading-[1] md:text-[30px]">{l.label}</h3>
                  <span className="mt-4 inline-flex h-8 items-center rounded-full bg-cream px-4 text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink transition-colors duration-300 group-hover:bg-ochre">Shop the look</span>
                </div>
                <span className="absolute bottom-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-cream/20 text-cream backdrop-blur-sm transition-transform duration-500 ease-[var(--ease-lux)] group-hover:rotate-[-45deg]" aria-hidden>
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
