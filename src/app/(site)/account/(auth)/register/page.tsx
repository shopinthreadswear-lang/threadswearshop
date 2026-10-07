import { RegisterForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Create Account", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <RegisterForm />
  );
}
