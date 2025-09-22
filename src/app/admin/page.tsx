// src/app/admin/page.tsx
import { supabaseServer } from "@/app/actions/supabase-server";
import { redirect } from "next/navigation";

export default async function AdminRoot() {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supa
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/orders");

  // 👇 dashboard real del admin
  redirect("/admin/orders");
}
