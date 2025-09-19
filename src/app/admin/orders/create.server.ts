// src/app/admin/orders/create.server.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { supabaseServer } from "@/app/actions/supabase-server";
import { redirect } from "next/navigation";

export async function adminCreateOrderAction(formData: FormData) {
  const ssg = await supabaseServer();
  const { data: { user } } = await ssg.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const admin = supabaseAdmin();
  const { data: me } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!me || me.role !== "admin") throw new Error("No autorizado");

  // requester al que el admin le crea la orden
  const requesterId = String(formData.get("requester_id") || "");
  const purpose = String(formData.get("purpose") || "");
  const link = String(formData.get("link") || "");
  const name = String(formData.get("item_name") || "");
  const unit_price = Number(formData.get("unit_price") || 0);
  const quantity = Number(formData.get("quantity") || 0);

  if (!requesterId || !purpose || !name || unit_price <= 0 || quantity <= 0) {
    throw new Error("Datos inválidos");
  }

  const { data: order, error: e1 } = await admin
    .from("purchase_orders")
    .insert({ requester_id: requesterId, purpose, link: link || null })
    .select("id")
    .single();
  if (e1) throw e1;

  const { error: e2 } = await admin.from("purchase_order_items").insert({
    order_id: order.id,
    name,
    unit_price,
    quantity,
  });
  if (e2) throw e2;

  redirect("/admin/orders");
}
