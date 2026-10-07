import { Lock, ReturnIcon, Shield, Truck } from "@/components/ui/Icons";
import { cn } from "@/lib/cn";

const ITEMS = [
  { icon: Truck, title: "Complimentary Shipping", text: "On orders above ₹2,999" },
  { icon: ReturnIcon, title: "15-Day Returns", text: "Free pickup & exchanges" },
  { icon: Lock, title: "Secure Payments", text: "256-bit encrypted checkout" },
  { icon: Shield, title: "Quality Checked", text: "21-point inspection" },
];

export function TrustBar({ className }: { className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-y-6 border-y border-line py-7 md:grid-cols-4", className)}>
      {ITEMS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-center justify-center gap-3 px-3 text-left">
          <Icon size={20} className="shrink-0 text-charcoal" />
          <span>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]">{title}</span>
            <span className="block text-[12.5px] text-muted">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
