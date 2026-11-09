import { Check, Lock, ReturnIcon, Truck } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { commerce, formatINR } from "@/lib/site";

const ITEMS = [
  { icon: Truck, text: `Free shipping over ${formatINR(commerce.freeShippingThreshold)}` },
  { icon: Lock, text: "Secure payment" },
  { icon: Check, text: "Cut & checked in Mumbai" },
  { icon: ReturnIcon, text: `${commerce.returnWindowDays}-day returns` },
];

/** The house promises, set as a quiet strip of icons under the hero. */
export function TrustBar() {
  return (
    <section aria-label="Our promises" className="border-b border-line bg-sand">
      <ul className="container-site no-scrollbar flex snap-x snap-mandatory overflow-x-auto py-5 md:grid md:grid-cols-4 md:overflow-visible md:py-6">
        {ITEMS.map(({ icon: Icon, text }, i) => (
          <Reveal as="li" key={text} delay={i * 80} className="flex shrink-0 snap-start items-center justify-center gap-3 px-6 first:pl-0 md:border-l md:border-ink/15 md:px-4 md:first:border-l-0">
            <Icon size={20} className="shrink-0 text-burgundy" />
            <span className="whitespace-nowrap text-[13px] font-bold text-ink">{text}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
