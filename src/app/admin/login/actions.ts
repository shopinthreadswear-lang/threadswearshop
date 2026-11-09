"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfigured, checkAdminLogin, endAdminSession, startAdminSession } from "@/lib/server/admin";

export type LoginState = { error: string; email?: string } | null;

// Slow down password guessing: 5 tries per 15 minutes per address, then a lockout.
const tries = new Map<string, { n: number; reset: number }>();
const WINDOW = 15 * 60_000;
const LIMIT = 5;

export async function adminLogin(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);
  const next = String(form.get("next") ?? "");
  if (!adminConfigured()) return { error: "Admin sign-in isn’t set up yet. Add ADMIN_EMAIL and ADMIN_PASSWORD to the environment variables, then redeploy.", email };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const t = tries.get(ip);
  if (t && t.reset > now && t.n >= LIMIT) return { error: "Too many attempts. Wait 15 minutes and try again.", email };

  if (!email || !password || !checkAdminLogin(email, password)) {
    tries.set(ip, t && t.reset > now ? { n: t.n + 1, reset: t.reset } : { n: 1, reset: now + WINDOW });
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That email and password don’t match the admin login.", email };
  }
  tries.delete(ip);
  await startAdminSession();
  redirect(/^\/admin(\/[\w\-/?=&.]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function adminLogout() {
  await endAdminSession();
  redirect("/admin/login");
}
