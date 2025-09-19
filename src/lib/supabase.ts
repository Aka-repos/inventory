// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// Uso solo en el servidor (Server Actions)
export const supabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,           // URL
    process.env.SUPABASE_SERVICE_ROLE_KEY!,          // SERVICE KEY (no exponer en cliente)
    { auth: { persistSession: false } }
  );
