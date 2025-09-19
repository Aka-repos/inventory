// src/app/admin/orders/server.ts
"use server";
import { supabaseServer } from "@/app/actions/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";


export async function setOrderStatus(orderId: string, status: "approved"|"rejected") {
  // 1) Verifica sesión
  const ssg = await supabaseServer();
  const { data: { user } } = await ssg.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // 2) Verifica rol admin
  const admin = supabaseAdmin();
  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (meErr) throw meErr;
  if (!me || me.role !== "admin") throw new Error("No autorizado");

  // 3) Actualiza estado
  const { error } = await admin
    .from("purchase_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;
}
