import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export const dynamic = "force-dynamic";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login?next=/account");
  return (
    <div className="container-site grid gap-10 pb-24 pt-10 md:pt-16 lg:grid-cols-12 lg:gap-16">
      <aside className="lg:col-span-3">
        <AccountSidebar name={user.firstName} email={user.email} />
      </aside>
      <div className="min-w-0 lg:col-span-9">{children}</div>
    </div>
  );
}
