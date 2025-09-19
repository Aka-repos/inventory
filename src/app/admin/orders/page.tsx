// src/app/admin/orders/page.tsx
import { supabaseServer } from "@/app/actions/supabase-server"
import { setOrderStatus } from "./server";

export default async function AdminOrdersPage() {
  const ssg = await supabaseServer();
  const { data: { user } } = await ssg.auth.getUser();
  if (!user) return <div>Inicia sesión</div>;

  const { data: orders, error } = await ssg
    .from("purchase_orders")
    .select("id,status,purpose,created_at")
    .order("created_at", { ascending: false });

  if (error) return <pre>{error.message}</pre>;

  return (
    <main style={{ padding: 16 }}>
      <h1>Órdenes (admin)</h1>
      <ul>
        {orders?.map(o => (
          <li key={o.id} style={{ display: "flex", gap: 8 }}>
            <span><b>{o.purpose}</b> — {o.status}</span>

            <form action={setOrderStatus.bind(null, o.id, "approved")}>
              <button disabled={o.status !== "pending"}>Aprobar</button>
            </form>

            <form action={setOrderStatus.bind(null, o.id, "rejected")}>
              <button disabled={o.status !== "pending"}>Rechazar</button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
