import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "Secure Checkout", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <>
      <h1 className="sr-only">Secure Checkout</h1>
      <CheckoutForm />
    </>
  );
}
