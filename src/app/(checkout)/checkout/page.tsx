import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { onlinePaymentsEnabled } from "@/lib/server/payments";

export const metadata = { title: "Secure Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <>
      <h1 className="sr-only">Secure Checkout</h1>
      <CheckoutForm online={onlinePaymentsEnabled()} />
    </>
  );
}
