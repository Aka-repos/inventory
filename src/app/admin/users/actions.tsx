// app/admin/users/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { supabaseServer } from "@/app/actions/supabase-server";

type CreateUserInput = {
  email: string;
  password: string;       // o puedes enviar invitación sin password
  full_name: string;
  employee_number?: string;
  role: "admin" | "user";
};

export async function adminCreateUser(input: CreateUserInput) {
  // Verifica que quien llama es admin
  const ssg = await supabaseServer();
  const { data: { user }, error: uerr } = await ssg.auth.getUser();
  if (uerr || !user) throw new Error("No autenticado");

  const admin = supabaseAdmin();
  const { data: me } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!me || me.role !== "admin") throw new Error("No autorizado");

  // 1) Crear usuario en Auth
  const { data: created, error: e1 } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,      // o usa email_invite si prefieres
    email_confirm: true,           // marca como verificado
    user_metadata: { full_name: input.full_name },
  });
  if (e1 || !created.user) throw e1 || new Error("createUser failed");

  // 2) Crear perfil
  const { error: e2 } = await admin
    .from("profiles")
    .insert({
      id: created.user.id,
      full_name: input.full_name,
      employee_number: input.employee_number ?? null,
      role: input.role,
    });
  if (e2) throw e2;

  return created.user.id;
}
