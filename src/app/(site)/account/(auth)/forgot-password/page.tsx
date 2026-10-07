import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Forgot Password", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <ForgotForm />
  );
}
