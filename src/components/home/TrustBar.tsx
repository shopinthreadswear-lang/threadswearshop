import { Check, Lock, ReturnIcon, Truck } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";
import { commerce, formatINR } from "@/lib/site";

const items = () => [
  { icon: Truck, title: "Free shipping", text: `On every order over ${formatINR(commerce.freeShippingThreshold)}` },
  { icon: Lock, title: "Secure payment", text: "UPI, cards and cash on delivery" },
  { icon: Check, title: "Cut in Mumbai", text: "Every piece checked by hand" },
  { icon: ReturnIcon, title: `${commerce.returnWindowDays}-day returns`, text: "Free pickup from your door" },
];

/** The house promises: four icon blocks with a bold title and a quiet line, right under the hero. */
export function TrustBar() {
  return (
    <section aria-label="Our promises" className="border-b border-line bg-paper">
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 py-4 max-sm:px-4 sm:container-site sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-7 sm:overflow-visible sm:py-8 lg:grid-cols-4 lg:gap-0 lg:py-9">
        {items().map(({ icon: Icon, title, text }, i) => (
          <Reveal as="li" key={title} delay={i * 90} className="group flex w-[72%] shrink-0 snap-start items-center gap-3 rounded-2xl border border-line bg-ivory px-3.5 py-3 sm:border-0 sm:w-auto sm:gap-3.5 sm:rounded-none sm:bg-transparent sm:p-0 lg:justify-center lg:border-l lg:border-line lg:px-5 lg:first:border-l-0">
            <span className="grid h-10 w-10 shrink-0 sm:h-12 sm:w-12 place-items-center rounded-full bg-burgundy text-cream transition-transform duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-110">
              <Icon size={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-[12.5px] font-extrabold uppercase tracking-[0.06em] text-ink lg:text-[13px]">{title}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted">{text}</span>
            </span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
