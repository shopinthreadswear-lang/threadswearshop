import { cn } from "@/lib/cn";

const METHODS = ["UPI", "Visa", "Mastercard", "RuPay", "Amex", "Net Banking", "Wallets", "COD"];

export function PaymentBadges({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Accepted payment methods">
      {METHODS.map((m) => (
        <li key={m} className={cn("border px-2 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em]", light ? "border-ivory/20 text-ivory/70" : "border-line text-muted")}>
          {m}
        </li>
      ))}
    </ul>
  );
}
