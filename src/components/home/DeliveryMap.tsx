import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Doodle } from "@/components/doodles/Doodle";
import { SpringHeading } from "@/components/motion/Scroll";
import { IndiaMap } from "./IndiaMap";

/** Espresso colour block: a hand-drawn map of India with pins where the boxes go. */
export function DeliveryMap() {
  return (
    <section aria-labelledby="map-title" className="relative overflow-hidden bg-espresso text-cream">
      <div className="container-site grid items-center gap-12 py-20 md:grid-cols-2 md:py-24 lg:py-28">
        <Reveal className="max-w-md">
          <SpringHeading id="map-title" className="display-lg" parts={["Find us at", { em: "your door", className: "text-champagne-soft" }]} />
          <p className="mt-6 font-mono text-[13px] leading-[1.8] text-cream/85">
            Packed by hand in our Mumbai studio and dispatched within 24 hours on working days. Metro cities in 2–4 days, everywhere else in 4–7 — free above ₹2,999.
          </p>
          <Link href="/shipping" className="btn btn-light btn-sm mt-8">
            Delivery details
          </Link>
          <Doodle name="arrow" draw delay={500} className="mt-10 hidden w-24 rotate-[-8deg] text-champagne-soft md:block" strokeWidth={1.8} />
        </Reveal>

        <Reveal delay={120} className="relative mx-auto w-full max-w-[460px]">
          <IndiaMap />
        </Reveal>
      </div>
    </section>
  );
}
