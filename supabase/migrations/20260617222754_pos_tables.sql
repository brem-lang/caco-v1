-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  image_url     text,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.categories enable row level security;
grant select, insert, update, delete on public.categories to authenticated;

create policy "categories_all" on public.categories
  for all to authenticated using (true) with check (true);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid references public.categories(id) on delete set null,
  name          text not null,
  description   text,
  image_url     text,
  base_price    numeric(10,2) not null,
  is_available  boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.products enable row level security;
grant select, insert, update, delete on public.products to authenticated;

create policy "products_all" on public.products
  for all to authenticated using (true) with check (true);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
create table if not exists public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  name           text not null,
  price_modifier numeric(10,2) not null default 0,
  is_available   boolean not null default true
);

alter table public.product_variants enable row level security;
grant select, insert, update, delete on public.product_variants to authenticated;

create policy "product_variants_all" on public.product_variants
  for all to authenticated using (true) with check (true);

-- ============================================================
-- INVENTORY ITEMS
-- ============================================================
create table if not exists public.inventory_items (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  unit               text not null,
  current_stock      numeric(10,2) not null default 0,
  minimum_stock      numeric(10,2) not null default 0,
  cost_per_unit      numeric(10,2),
  supplier           text,
  last_restocked_at  timestamptz,
  created_at         timestamptz not null default now()
);

alter table public.inventory_items enable row level security;
grant select, insert, update, delete on public.inventory_items to authenticated;

create policy "inventory_items_all" on public.inventory_items
  for all to authenticated using (true) with check (true);

-- ============================================================
-- PRODUCT INGREDIENTS
-- ============================================================
create table if not exists public.product_ingredients (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products(id) on delete cascade,
  inventory_item_id   uuid not null references public.inventory_items(id) on delete cascade,
  quantity_used       numeric(10,4) not null
);

alter table public.product_ingredients enable row level security;
grant select, insert, update, delete on public.product_ingredients to authenticated;

create policy "product_ingredients_all" on public.product_ingredients
  for all to authenticated using (true) with check (true);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    serial,
  cashier_id      uuid references public.profiles(id) on delete set null,
  status          text not null default 'pending'
                    check (status in ('pending','preparing','ready','completed','cancelled')),
  payment_method  text not null
                    check (payment_method in ('cash','card','gcash','maya')),
  subtotal        numeric(10,2) not null,
  tax             numeric(10,2) not null default 0,
  discount        numeric(10,2) not null default 0,
  total           numeric(10,2) not null,
  notes           text,
  created_at      timestamptz not null default now(),
  completed_at    timestamptz
);

alter table public.orders enable row level security;
grant select, insert, update, delete on public.orders to authenticated;

create policy "orders_all" on public.orders
  for all to authenticated using (true) with check (true);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  variant_id    uuid references public.product_variants(id) on delete set null,
  product_name  text not null,
  variant_name  text,
  unit_price    numeric(10,2) not null,
  quantity      int not null check (quantity > 0),
  subtotal      numeric(10,2) not null
);

alter table public.order_items enable row level security;
grant select, insert, update, delete on public.order_items to authenticated;

create policy "order_items_all" on public.order_items
  for all to authenticated using (true) with check (true);

-- ============================================================
-- CASH SESSIONS
-- ============================================================
create table if not exists public.cash_sessions (
  id               uuid primary key default gen_random_uuid(),
  opened_by        uuid references public.profiles(id) on delete set null,
  closed_by        uuid references public.profiles(id) on delete set null,
  opening_amount   numeric(10,2) not null,
  closing_amount   numeric(10,2),
  expected_cash    numeric(10,2),
  cash_difference  numeric(10,2),
  status           text not null default 'open'
                     check (status in ('open','closed')),
  notes            text,
  opened_at        timestamptz not null default now(),
  closed_at        timestamptz
);

alter table public.cash_sessions enable row level security;
grant select, insert, update, delete on public.cash_sessions to authenticated;

create policy "cash_sessions_all" on public.cash_sessions
  for all to authenticated using (true) with check (true);

-- ============================================================
-- INVENTORY LOGS
-- ============================================================
create table if not exists public.inventory_logs (
  id                  uuid primary key default gen_random_uuid(),
  inventory_item_id   uuid not null references public.inventory_items(id) on delete cascade,
  type                text not null
                        check (type in ('restock','usage','adjustment','waste')),
  quantity_change     numeric(10,2) not null,
  notes               text,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now()
);

alter table public.inventory_logs enable row level security;
grant select, insert, update, delete on public.inventory_logs to authenticated;

create policy "inventory_logs_all" on public.inventory_logs
  for all to authenticated using (true) with check (true);
