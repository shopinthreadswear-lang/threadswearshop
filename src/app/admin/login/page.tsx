import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/server/admin";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAdminSession()) redirect("/admin");
  const { next = "/admin" } = await searchParams;
  return (
    <main id="main" className="grid min-h-svh place-items-center bg-ivory px-4 py-12">
      <div className="w-full max-w-[400px]">
        <p className="text-center">
          <span className="font-serif text-[22px] font-black uppercase italic tracking-[-0.04em] text-burgundy">Threads Ware</span>
          <span className="ml-2 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">Admin</span>
        </p>
        <div className="mt-6 rounded-card border border-line bg-paper p-6 shadow-card sm:p-8">
          <h1 className="font-serif text-[26px] font-extrabold leading-tight text-ink">Team sign-in</h1>
          <p className="mt-1.5 text-[13.5px] text-muted">For the store owner only. Customer accounts can’t sign in here.</p>
          <LoginForm next={next} />
        </div>
      </div>
    </main>
  );
}
