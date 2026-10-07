import { Eyebrow } from "@/components/motion/Eyebrow";
import Link from "next/link";
import { Cloth3D } from "@/components/three/Cloth3D";
import { CTA_CLOTH } from "@/components/three/fabrics";
import { Magnetic } from "@/components/motion/Magnetic";
import { WordReveal } from "@/components/motion/WordReveal";
import { ArrowRight, Chat } from "@/components/ui/Icons";
import { site } from "@/lib/site";

/** 09 — The conclusion: one clear action, one human fallback. The suede cloth reacts to the pointer. */
export function FinalCTA() {
  return (
    <section id="start" data-section="Start" data-tone="dark" aria-labelledby="start-title" className="on-dark relative overflow-hidden bg-night text-ivory">
      <Cloth3D fabric={CTA_CLOTH} variant="cta" className="absolute inset-0 opacity-80" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/70" />
      <div className="container-site relative flex min-h-[86vh] flex-col items-center justify-center py-24 text-center">
        <Eyebrow light center>Your Next Piece</Eyebrow>
        <WordReveal id="start-title" text="Start with the piece you’ll wear most." className="display-xl mt-6 max-w-[16ch]" />
        <p className="mx-auto mt-7 max-w-lg text-[16px] leading-relaxed text-ivory/75">Most customers begin with a Mercer tee or a Kensington oxford — then build from there. Not sure of your size or fit? A stylist will help, free.</p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Magnetic>
            <Link href="/new-arrivals" className="btn btn-light">
              <span>Shop New Arrivals</span> <ArrowRight className="btn-arrow" size={15} />
            </Link>
          </Magnetic>
          <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn btn-ghost-light">
            <Chat size={16} /> <span>Ask a Stylist</span>
          </a>
        </div>
        <p className="mt-8 text-[12px] text-ivory/50">Free shipping over ₹2,999 · 15-day free returns · Secure checkout</p>
      </div>
    </section>
  );
}
