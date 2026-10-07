import { getCurrentUser } from "@/lib/server/auth";
import { ProfileForm } from "@/components/account/AccountForms";

export const metadata = { title: "Profile", robots: { index: false } };

export default async function Page() {
  const user = (await getCurrentUser())!;
  return (
    <>
      <h1 className="display-md">Profile</h1>
      <p className="mb-10 mt-3 text-[14px] text-muted">Your personal details and password.</p>
      <ProfileForm user={user} />
    </>
  );
}
