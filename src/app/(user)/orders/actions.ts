// app/(user)/orders/actions.ts
"use server";

import { supabaseServer } from "@/app/actions/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function createOrderAction(formData: FormData) {
  const ssg = await supabaseServer();
  const { data: { user }, error: userErr } = await ssg.auth.getUser();
  if (userErr || !user) throw new Error("No autenticado");

  const purpose = String(formData.get("purpose") || "");
  const link = String(formData.get("link") || "");
  const name = String(formData.get("item_name") || "");
  const unit_price = Number(formData.get("unit_price") || 0);
  const quantity = Number(formData.get("quantity") || 0);

  if (!purpose || !name || unit_price <= 0 || quantity <= 0) {
    throw new Error("Datos inválidos");
  }

  // Usamos service role para insertar de forma transaccional
  const admin = supabaseAdmin();

  const { data: order, error: e1 } = await admin
    .from("purchase_orders")
    .insert({ requester_id: user.id, purpose, link: link || null })
    .select("id")
    .single();
  if (e1) throw e1;

  const { error: e2 } = await admin
    .from("purchase_order_items")
    .insert({
      order_id: order.id,
      name,
      unit_price,
      quantity,
    });
  if (e2) throw e2;

  redirect("/(user)/orders"); // vuelve a la lista
}
