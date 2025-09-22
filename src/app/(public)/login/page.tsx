import { supabaseServer } from "@/app/actions/supabase-server";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const supa = await supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (user)  {
    // Lee el rol desde tu tabla de perfiles
    const { data: profile } = await supa
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    
    const role = (profile?.role as "admin" | "user") ?? "user";
    redirect(role === "admin" ? "/admin/orders" : "/orders");
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        background:
          "radial-gradient(1200px 600px at 80% -10%, rgba(99,102,241,.15), transparent 60%), radial-gradient(900px 500px at -10% 20%, rgba(59,130,246,.12), transparent 60%)"
      }}
    >
      <section style={{ width: "100%", maxWidth: 420 }}>
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700 }}>
            Iniciar sesión
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6b7280" }}>
            Accede a tu cuenta para gestionar tus órdenes.
          </p>
        </header>
        <LoginForm />
      </section>
    </main>
  );
}
