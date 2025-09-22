// src/app/actions/supabase-server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";

export async function supabaseServer() {
  const cookieStore = await cookies();

  const cookiesAdapter = {
    getAll: () => cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    setAll: () => {
      /* no-op en RSC; escritura la hace el middleware */
    },
  } satisfies CookieMethodsServer;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookiesAdapter,
      cookieEncoding: "base64url",
    }
  );
}
