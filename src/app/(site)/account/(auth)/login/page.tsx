import { LoginForm } from "@/components/auth/AuthForms";

export const metadata = { title: "Sign In", robots: { index: false, follow: true } };

export default function Page() {
  return (
    <LoginForm />
  );
}
