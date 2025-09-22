// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

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
    {
      cookies: cookiesAdapter,
      cookieEncoding: "base64url",
    }
  );

  const { data: { user } } = await supa.auth.getUser();
  const url = req.nextUrl;
  const path = url.pathname;

  // Si ya está logueado y visita /login, decídelo por rol aquí
  if (path === "/login" && user) {
    const { data: profile } = await supa
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile?.role as "admin" | "user") ?? "user";
    return NextResponse.redirect(new URL(role === "admin" ? "/admin/orders" : "/(user)/orders/", url));

    
  }
console.log("MW user:", user?.id, "path:", path);
  // Proteger /admin/**
  if (path.startsWith("/admin")) {
    if (!user) return NextResponse.redirect(new URL("/login", url));

    const { data: profile } = await supa
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile?.role as "admin" | "user") ?? "user";
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/(user)/orders", url));
    }

    // Si un admin cae en /admin (raíz), reenvía a /admin/orders
    if (path === "/admin") {
      return NextResponse.redirect(new URL("/admin/orders", url));
    }
  }

  // Proteger /orders/**
  if (path.startsWith("/(user)/orders/")) {
    if (!user) return NextResponse.redirect(new URL("/login", url));
  }

  return res;
}




export const config = {
  matcher: ["/login", "/admin/:path*", "/orders/:path*"],
};
