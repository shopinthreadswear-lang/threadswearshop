import Image from "next/image";
import { GiftCardForm, BalanceCheck } from "./GiftCardForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AccordionItem } from "@/components/ui/Accordion";
import { IMG } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Digital Gift Cards", description: "Give the gift of Threads Ware. Digital gift cards from ₹2,000 to ₹25,000, delivered instantly by email with a personal message.", path: "/gift-cards", image: IMG.packaging });

export default function GiftCardsPage() {
  return (
    <div className="container-site pb-24 pt-10 md:pt-16">
      <Breadcrumb items={[{ label: "Gift Cards" }]} className="mb-8" />
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden bg-night">
            <Image src={IMG.packaging} alt="Threads Ware gift packaging" fill priority sizes="(max-width:1024px) 100vw, 50vw" className="object-cover opacity-70 grayscale-[0.85]" />
            <div className="absolute inset-0 grid place-items-center p-10">
              <div className="aspect-[1.6] w-full max-w-sm border border-champagne-soft/60 bg-night/80 p-7 text-ivory backdrop-blur-sm">
                <div className="flex h-full flex-col justify-between">
                  <p className="font-serif text-[13px] uppercase tracking-[0.32em]">Threads | Ware</p>
                  <div>
                    <p className="eyebrow text-[11px] text-champagne-soft">Digital Gift Card</p>
                    <p className="mt-1 font-serif text-[34px] leading-none">A gift, considered.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="eyebrow text-muted">Gift Cards</p>
          <h1 className="display-lg mt-4">The gift of Threads Ware.</h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">Delivered instantly by email with your personal message. Redeemable online across everything we make, and valid for 12 months.</p>
          <GiftCardForm />
          <div className="mt-14 border-t border-line">
            <AccordionItem title="How it works">Choose an amount, add the recipient’s details and a message. After checkout, we email a unique code to the recipient — immediately, or on the date you choose.</AccordionItem>
            <AccordionItem title="Redeeming">Enter the code in the payment step at checkout. Any remaining balance stays on the card for future orders.</AccordionItem>
            <AccordionItem title="Terms">Valid for 12 months from issue. Cannot be exchanged for cash or used to buy other gift cards. Treat your code like cash.</AccordionItem>
          </div>
          <BalanceCheck />
        </div>
      </div>
    </div>
  );
}
