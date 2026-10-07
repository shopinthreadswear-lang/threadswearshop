import { ResetForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Reset Password", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <ResetForm />
  );
}
