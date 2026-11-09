import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Refreshes the Supabase auth session on each request and returns the response carrying any updated cookies.
 * Called from `src/proxy.ts` (Next 16's name for middleware).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  if (!supabaseUrl || !supabaseKey) return supabaseResponse;
  // Nobody is signed in to Supabase on this request — nothing to refresh, skip the network call.
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return supabaseResponse;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Don't put code between client creation and this call: it is what actually refreshes an expired session.
  await supabase.auth.getUser();
  return supabaseResponse;
}
