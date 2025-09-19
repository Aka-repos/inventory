-- Enum de roles y estado de órdenes
create type user_role as enum ('admin','user');
create type order_status as enum ('pending','approved','rejected');

-- Perfiles (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  employee_number text unique,
  role user_role not null default 'user',
  created_at timestamptz default now()
);

-- Órdenes de compra (encabezado)
create table public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete restrict,
  status order_status not null default 'pending',
  purpose text not null,   -- para qué se usará
  link text,               -- url o contacto
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ítems de orden (solo 1 item para MVP, pero dejamos la tabla correcta)
create table public.purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.purchase_orders(id) on delete cascade,
  name text not null,                 -- nombre del producto/servicio
  unit_price numeric(12,2) not null,  -- precio unitario
  quantity numeric(12,2) not null check (quantity > 0),
  total numeric(14,2) generated always as (unit_price * quantity) stored
);

-- Habilitar RLS
alter table public.profiles enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_items enable row level security;

-- Políticas mínimas
-- Profiles: ver tu perfil o si eres admin ver todos
create policy "read own or admin" on public.profiles
for select using (
  auth.uid() = id OR exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);

-- Orders: un usuario ve SUS órdenes; admin ve todas
create policy "user reads own orders" on public.purchase_orders
for select using (requester_id = auth.uid());

create policy "admin reads orders" on public.purchase_orders
for select using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- Crear órdenes: requester debe ser el usuario autenticado
create policy "user creates own orders" on public.purchase_orders
for insert with check (requester_id = auth.uid());

-- Actualizar estado: SOLO admin
create policy "admin updates orders" on public.purchase_orders
for update using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='admin'));

-- Ítems: lectura si puedes leer la orden
create policy "read items if can read order" on public.purchase_order_items
for select using (
  exists(select 1 from public.purchase_orders o where o.id = order_id and (o.requester_id = auth.uid()
    or exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')))
);

-- Insert ítems: al crear la orden
create policy "insert items with order" on public.purchase_order_items
for insert with check (
  exists(select 1 from public.purchase_orders o where o.id = order_id and o.requester_id = auth.uid())
);

-- INSERT por admin
create policy "admin inserts profiles"
on public.profiles
for insert
with check (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);

-- UPDATE por admin
create policy "admin updates profiles"
on public.profiles
for update
using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);

-- DELETE por admin (opcional)
create policy "admin deletes profiles"
on public.profiles
for delete
using (
  exists(select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
);
