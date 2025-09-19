// app/admin/orders/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { supabaseServer } from "@/app/actions/supabase-server";

export async function setOrderStatus(
  orderId: string,
  status: "approved" | "rejected"
) {
  // 1) Autenticación
  const ssg = await supabaseServer();
  const { data: userData, error: authErr } = await ssg.auth.getUser();
  if (authErr) throw authErr;
  const user = userData?.user;
  if (!user) throw new Error("No autenticado");

  // 2) Autorización (rol admin)
  const admin = supabaseAdmin();
  const { data: me, error: meErr } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (meErr) throw meErr;
  if (!me || me.role !== "admin") throw new Error("No autorizado");

  // 3) Verificar existencia y estado actual de la orden
  const { data: order, error: orderErr } = await admin
    .from("purchase_orders")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (orderErr) throw orderErr;
  if (!order) throw new Error("Orden no existe");

  // Si ya está en el mismo estado, no hacemos nada
  if (order.status === status) {
    return { ok: true, changed: false };
  }

  // 4) Actualizar estado
  const { error } = await admin
    .from("purchase_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) throw error;

  return { ok: true, changed: true };
}
