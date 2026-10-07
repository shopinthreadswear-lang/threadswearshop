import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ACCOUNT = ["/account/login", "/account/register", "/account/forgot-password", "/account/reset-password"];

/** Fast gate for protected routes. Full session verification happens server-side in the account layout. */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/account") && !PUBLIC_ACCOUNT.some((p) => pathname.startsWith(p))) {
    if (!req.cookies.get("tw_session")) {
      const url = req.nextUrl.clone();
      url.pathname = "/account/login";
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/account/:path*"] };
