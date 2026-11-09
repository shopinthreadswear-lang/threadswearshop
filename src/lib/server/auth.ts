import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";
import type { PublicUser, User } from "@/lib/types";
import { read } from "./store";

export const SESSION_COOKIE = "tw_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production");
  }
  return s || "dev-only-insecure-secret-change-me";
}

const b64url = (b: Buffer | string) => Buffer.from(b).toString("base64url");

export function sign(payload: object) {
  const body = b64url(JSON.stringify(payload));
  const mac = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

export function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp: number };
    if (data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const token = sign({ uid: userId, exp: Date.now() + MAX_AGE * 1000 });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export function toPublic(u: User): PublicUser {
  const { passwordHash: _ph, ...rest } = u;
  void _ph;
  return rest;
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = verify<{ uid: string }>((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await read((db) => db.users.find((u) => u.id === session.uid));
  return user && !user.blocked ? toPublic(user) : null;
}

export async function getSessionUserId() {
  return verify<{ uid: string }>((await cookies()).get(SESSION_COOKIE)?.value)?.uid ?? null;
}

/** Order access tokens let guests view their confirmation without an account. */
export function orderToken(orderId: string, accessToken: string) {
  return crypto.createHmac("sha256", secret()).update(`${orderId}:${accessToken}`).digest("base64url").slice(0, 32);
}
