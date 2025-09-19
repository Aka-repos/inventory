// app/actions/upsertProfile.ts
"use server";
import { supabaseAdmin } from "@/lib/supabase";

export async function ensureProfile(userId: string, fullName: string) {
  const supa = supabaseAdmin();
  await supa.from("profiles").upsert({ id: userId, full_name: fullName });
}
