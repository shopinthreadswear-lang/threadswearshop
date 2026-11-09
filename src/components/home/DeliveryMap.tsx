import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Squiggle } from "@/components/ui/SectionTitle";
import { IndiaMap } from "./IndiaMap";

/** Espresso colour block: a hand-drawn map of India with pins where the boxes go. */
export function DeliveryMap() {
  return (
    <section aria-labelledby="map-title" className="relative overflow-hidden bg-espresso text-cream">
      <div className="container-site grid items-center gap-12 py-20 md:grid-cols-2 md:py-24 lg:py-28">
        <Reveal className="max-w-md">
          <h2 id="map-title" className="display-lg">
            Find us at <span className="text-ochre">your door</span>
          </h2>
          <Squiggle className="mt-5 text-ochre" />
          <p className="mt-6 text-[14px] font-medium leading-[1.8] text-cream/85">
            Packed by hand in our Mumbai studio and dispatched within 24 hours on working days. Metro cities in 2–4 days, everywhere else in 4–7 — free above ₹2,999.
          </p>
          <Link href="/shipping" className="btn btn-light btn-sm mt-8">
            Delivery details
          </Link>
        </Reveal>

        <Reveal delay={120} className="relative mx-auto w-full max-w-[460px]">
          <IndiaMap />
        </Reveal>
      </div>
    </section>
  );
}
