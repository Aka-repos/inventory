import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });

  const cookiesAdapter = {
    getAll: () => req.cookies.getAll().map(({ name, value }) => ({ name, value })),
    setAll: (cookies) => {
      cookies.forEach(({ name, value, options }) => {
        res.cookies.set(name, value, options);
      });
    },
  } satisfies CookieMethodsServer;

  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookiesAdapter, cookieEncoding: "base64url" }
  );

  await supa.auth.signOut();
  return res;
}
