import { getCurrentUser } from "@/lib/server/auth";
import { AddressBook } from "@/components/account/AccountForms";

export const metadata = { title: "Addresses", robots: { index: false } };

export default async function Page() {
  const user = (await getCurrentUser())!;
  return (
    <>
      <h1 className="display-md">Addresses</h1>
      <p className="mb-10 mt-3 text-[14px] text-muted">Manage where we deliver your orders.</p>
      <AddressBook addresses={user.addresses} />
    </>
  );
}
