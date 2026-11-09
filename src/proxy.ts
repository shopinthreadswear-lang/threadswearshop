import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PUBLIC_ACCOUNT = ["/account/login", "/account/register", "/account/forgot-password", "/account/reset-password"];

/**
 * Runs before matching requests:
 * 1. Fast gate for protected account routes (full session verification happens server-side in the account layout).
 * 2. Keeps a Supabase auth session fresh, so server code always sees a valid user.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const gated = pathname.startsWith("/admin") || (pathname.startsWith("/account") && !PUBLIC_ACCOUNT.some((p) => pathname.startsWith(p)));
  if (gated) {
    if (!req.cookies.get("tw_session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/account/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }
  return updateSession(req);
}

export const config = {
  // Every page and API route, but not static files, images or Next internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|woff2?)$).*)"],
};
