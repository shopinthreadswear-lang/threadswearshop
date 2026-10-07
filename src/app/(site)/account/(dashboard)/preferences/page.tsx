import { getCurrentUser } from "@/lib/server/auth";
import { PreferencesForm } from "@/components/account/AccountForms";

export const metadata = { title: "Preferences", robots: { index: false } };

export default async function Page() {
  const user = (await getCurrentUser())!;
  return (
    <>
      <h1 className="display-md">Preferences</h1>
      <p className="mb-10 mt-3 text-[14px] text-muted">Choose how we keep in touch.</p>
      <PreferencesForm prefs={user.preferences} />
    </>
  );
}
