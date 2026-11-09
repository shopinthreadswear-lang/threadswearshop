"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfigured, checkAdminLogin, endAdminSession, getAdminSession, log, startAdminSession } from "@/lib/server/admin";
import { write } from "@/lib/server/store";

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

  const user = email && password ? await checkAdminLogin(email, password) : null;
  if (!user) {
    tries.set(ip, t && t.reset > now ? { n: t.n + 1, reset: t.reset } : { n: 1, reset: now + WINDOW });
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That email and password don’t match an admin login.", email };
  }
  tries.delete(ip);
  await write((db) => {
    const m = db.staff?.find((x) => x.id === user.id);
    if (m) m.lastLoginAt = new Date().toISOString();
    log(db, user, "team", "Signed in");
  });
  await startAdminSession(user);
  redirect(/^\/admin(\/[\w\-/?=&.]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin");
}

export async function adminLogout() {
  const user = await getAdminSession();
  if (user) await write((db) => log(db, user, "team", "Signed out"));
  await endAdminSession();
  redirect("/admin/login");
}
