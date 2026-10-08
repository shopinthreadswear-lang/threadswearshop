import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Doodle } from "@/components/doodles/Doodle";
import { IMG } from "@/data/images";
import { cn } from "@/lib/cn";

const LOOKS = [
  { id: "weekend", label: "The Weekend Uniform", href: "/collections/weekend-uniform", img: IMG.manStripedOverDenim, alt: "Man in a denim overshirt over a striped tee", focus: "50% 25%", pos: "md:left-[4%] md:top-[30%]", size: "md:w-[24%]" },
  { id: "dark", label: "After Dark", href: "/collections/after-dark", img: IMG.manTweed, alt: "Man in a tweed jacket with a satchel", focus: "50% 40%", pos: "md:right-[5%] md:top-[2%]", size: "md:w-[26%]" },
  { id: "wedding", label: "Wedding Season", href: "/collections/wedding-edit", img: IMG.manWaistcoat, alt: "Man in a navy waistcoat and tie", focus: "50% 25%", pos: "md:left-[38%] md:top-[54%]", size: "md:w-[24%]" },
];

/** Repeat the name until it fills the rim, so letter spacing stays close whatever its length. */
const rim = (label: string) => `${label} ✦ `.repeat(Math.max(2, Math.round(44 / (label.length + 3))));

/** A photo cut into a circle, with its name set around the rim like a stamp. */
function Circle({ look }: { look: (typeof LOOKS)[number] }) {
  const pid = `rim-${look.id}`;
  return (
    <Link href={look.href} className="group relative block aspect-square" data-cursor="Explore" aria-label={look.label}>
      <svg viewBox="0 0 200 200" className="spin-slow absolute inset-0 h-full w-full text-burgundy [animation-duration:40s] group-hover:[animation-duration:12s]" aria-hidden>
        <defs>
          <path id={pid} d="M100 100 m-88 0 a88 88 0 1 1 176 0 a88 88 0 1 1 -176 0" />
        </defs>
        <text className="fill-current font-mono text-[10px] font-medium uppercase" textLength={548} lengthAdjust="spacing">
          <textPath href={`#${pid}`} textLength={548} lengthAdjust="spacing">
            {rim(look.label)}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[13%] overflow-hidden rounded-full bg-bone">
        <Image src={look.img} alt={look.alt} fill sizes="(max-width:768px) 60vw, 22vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-lux)] group-hover:scale-[1.08]" style={{ objectPosition: look.focus }} />
      </div>
    </Link>
  );
}

/** "Looks that'll make you look good" — three outfits scattered on the page, with pen doodles in the margins. */
export function LookCircles() {
  return (
    <section aria-labelledby="looks-title" className="relative overflow-hidden py-20 md:py-28">
      <div className="container-site relative md:h-[min(70vw,860px)]">
        <Reveal className="relative z-10 text-center md:absolute md:left-[30%] md:top-[14%] md:w-[40%]">
          <h2 id="looks-title" className="display-md text-burgundy">
            Looks that’ll make <br className="hidden sm:block" />
            you look <em className="italic">good</em>
          </h2>
          <Link href="/collections" className="btn btn-primary btn-sm mt-7">
            All looks
          </Link>
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-12 px-[8%] sm:grid-cols-2 sm:px-0 md:contents">
          {LOOKS.map((l, i) => (
            <Reveal as="li" key={l.id} delay={i * 120} className={cn("mx-auto w-[78%] sm:w-full md:absolute md:mx-0", l.pos, l.size, i === 2 && "sm:col-span-2 sm:mx-auto sm:w-1/2")}>
              <Circle look={l} />
            </Reveal>
          ))}
        </ul>

        <Reveal className="pointer-events-none absolute left-[-2%] top-[2%] hidden w-36 text-burgundy md:block">
          <Doodle name="scissors" draw strokeWidth={1.6} />
        </Reveal>
        <Reveal className="pointer-events-none absolute right-[3%] top-[62%] hidden w-28 -rotate-12 text-burgundy md:block">
          <Doodle name="cup" draw strokeWidth={1.6} delay={200} />
        </Reveal>
        <Reveal className="pointer-events-none absolute left-[24%] top-[74%] hidden w-24 rotate-6 text-burgundy md:block">
          <Doodle name="arrow" draw strokeWidth={1.6} delay={400} />
        </Reveal>
      </div>
    </section>
  );
}
