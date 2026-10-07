import { getCurrentUser } from "@/lib/server/auth";
import { PaymentMethods } from "@/components/account/AccountForms";

export const metadata = { title: "Saved Payment Methods", robots: { index: false } };

export default async function Page() {
  const user = (await getCurrentUser())!;
  return (
    <>
      <h1 className="display-md">Saved Payment Methods</h1>
      <p className="mb-10 mt-3 text-[14px] text-muted">Securely saved for a faster checkout.</p>
      <PaymentMethods payments={user.payments} />
    </>
  );
}
