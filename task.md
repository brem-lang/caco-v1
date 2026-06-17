# ☕ Coffee Shop POS + Inventory System — Claude Plan Prompt

Paste this into Claude Code or Claude.ai to scaffold your full project.

---

## PROMPT

You are an expert full-stack developer. Build a **Coffee Shop POS (Point of Sale) + Inventory Management System** using the following stack:

- **Next.js 15** (App Router, TypeScript, strict mode)
- **Supabase** (PostgreSQL, Auth, Realtime, RLS)
- **shadcn/ui + Tailwind CSS v4**
- **Zod** for validation
- **Zustand** for client state

---

## PROJECT OVERVIEW

Build a complete POS and inventory system for a coffee shop with the following modules:

1. **Authentication** — Staff login (email + password)
2. **Cash Session** — Open/close cash drawer, declare opening amount, track cash flow per day
3. **POS Terminal** — Take orders, process payments, print receipts
4. **Menu Management** — Products, categories, variants, pricing
5. **Inventory Management** — Stock tracking, low stock alerts, suppliers
6. **Orders & History** — Order tracking, status updates, order history
7. **Dashboard & Reports** — Daily sales, top products, revenue charts

---

## FOLDER STRUCTURE (Next.js App Router Convention)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Dashboard / Overview
│   │   ├── pos/
│   │   │   └── page.tsx              # POS Terminal
│   │   ├── orders/
│   │   │   ├── page.tsx              # Orders list
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Order detail
│   │   ├── menu/
│   │   │   ├── page.tsx              # Menu management
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Edit product
│   │   ├── inventory/
│   │   │   ├── page.tsx              # Inventory list
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Edit stock item
│   │   ├── cash-session/
│   │   │   └── page.tsx              # Open/close cash session
│   │   ├── reports/
│   │   │   └── page.tsx              # Sales reports
│   │   └── settings/
│   │       └── page.tsx              # Shop settings
│   ├── api/
│   │   └── webhooks/
│   │       └── route.ts
│   ├── error.tsx
│   ├── not-found.tsx
│   └── layout.tsx
│
├── components/
│   ├── ui/                           # shadcn/ui components (auto-generated)
│   ├── pos/
│   │   ├── product-grid.tsx
│   │   ├── cart-panel.tsx
│   │   ├── order-summary.tsx
│   │   ├── payment-modal.tsx
│   │   └── receipt-modal.tsx
│   ├── menu/
│   │   ├── product-form.tsx
│   │   ├── category-list.tsx
│   │   └── product-card.tsx
│   ├── inventory/
│   │   ├── stock-table.tsx
│   │   ├── stock-form.tsx
│   │   └── low-stock-alert.tsx
│   ├── orders/
│   │   ├── order-list.tsx
│   │   ├── order-card.tsx
│   │   └── order-status-badge.tsx
│   ├── dashboard/
│   │   ├── sales-chart.tsx
│   │   ├── top-products.tsx
│   │   └── stats-cards.tsx
│   └── shared/
│       ├── sidebar.tsx
│       ├── header.tsx
│       ├── theme-toggle.tsx
│       └── loading-spinner.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser client
│   │   ├── server.ts                 # Server client (SSR)
│   │   └── middleware.ts             # Auth middleware helper
│   ├── validations/
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── inventory.ts
│   └── utils.ts                      # cn(), formatCurrency(), etc.
│
├── hooks/
│   ├── use-cart.ts
│   ├── use-products.ts
│   ├── use-inventory.ts
│   └── use-realtime-orders.ts
│
├── stores/
│   └── cart-store.ts                 # Zustand cart state
│
├── types/
│   ├── supabase.ts                   # Auto-generated DB types
│   ├── pos.ts
│   └── inventory.ts
│
├── actions/
│   ├── orders.ts                     # Server actions
│   ├── products.ts
│   └── inventory.ts
│
└── middleware.ts                     # Auth route protection
```

---

## SUPABASE DATABASE SCHEMA

Create the following tables with RLS enabled:

### `profiles`

```sql
id uuid references auth.users primary key,
full_name text,
avatar_url text,
created_at timestamptz default now()
```

### `categories`

```sql
id uuid primary key default gen_random_uuid(),
name text not null,
description text,
image_url text,
is_active boolean default true,
sort_order int default 0,
created_at timestamptz default now()
```

### `products`

```sql
id uuid primary key default gen_random_uuid(),
category_id uuid references categories(id),
name text not null,
description text,
image_url text,
base_price numeric(10,2) not null,
is_available boolean default true,
created_at timestamptz default now()
```

### `product_variants`

```sql
id uuid primary key default gen_random_uuid(),
product_id uuid references products(id) on delete cascade,
name text not null,          -- e.g. "Small", "Medium", "Large"
price_modifier numeric(10,2) default 0,
is_available boolean default true
```

### `inventory_items`

```sql
id uuid primary key default gen_random_uuid(),
name text not null,
unit text not null,           -- e.g. "kg", "liters", "pcs"
current_stock numeric(10,2) default 0,
minimum_stock numeric(10,2) default 0,
cost_per_unit numeric(10,2),
supplier text,
last_restocked_at timestamptz,
created_at timestamptz default now()
```

### `product_ingredients`

```sql
id uuid primary key default gen_random_uuid(),
product_id uuid references products(id) on delete cascade,
inventory_item_id uuid references inventory_items(id),
quantity_used numeric(10,4) not null  -- amount used per order
```

### `orders`

```sql
id uuid primary key default gen_random_uuid(),
order_number serial,
cashier_id uuid references profiles(id),
status text check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
payment_method text check (payment_method in ('cash', 'card', 'gcash', 'maya')),
subtotal numeric(10,2),
tax numeric(10,2),
discount numeric(10,2) default 0,
total numeric(10,2),
notes text,
created_at timestamptz default now(),
completed_at timestamptz
```

### `order_items`

```sql
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
product_id uuid references products(id),
variant_id uuid references product_variants(id),
product_name text not null,   -- snapshot at time of order
variant_name text,
unit_price numeric(10,2) not null,
quantity int not null,
subtotal numeric(10,2) not null
```

### `cash_sessions`

```sql
id uuid primary key default gen_random_uuid(),
opened_by uuid references profiles(id),
closed_by uuid references profiles(id),
opening_amount numeric(10,2) not null,
closing_amount numeric(10,2),
expected_cash numeric(10,2),        -- opening + cash sales
cash_difference numeric(10,2),      -- closing - expected (over/short)
status text check (status in ('open', 'closed')) default 'open',
notes text,
opened_at timestamptz default now(),
closed_at timestamptz
```

### `inventory_logs`

```sql
id uuid primary key default gen_random_uuid(),
inventory_item_id uuid references inventory_items(id),
type text check (type in ('restock', 'usage', 'adjustment', 'waste')),
quantity_change numeric(10,2),
notes text,
created_by uuid references profiles(id),
created_at timestamptz default now()
```

---

## KEY FEATURES TO BUILD

### Cash Session

- Staff must open a cash session before accessing POS
- Declare opening cash amount at start of shift/day
- POS is locked if no active session is open
- On close: enter actual cash on hand
- System calculates expected cash (opening + all cash sales)
- Shows cash difference (over or short)
- Summary of all payment method totals for the session
- Only one session can be open at a time

### POS Terminal

- Grid of products with category filter tabs
- Add to cart with variant selection (size, etc.)
- Cart panel with quantity controls, remove item
- Apply discount (percentage or fixed)
- Payment modal (cash, card, GCash, Maya)
- Auto-deduct inventory on order completion
- Print/view receipt
- Real-time order status via Supabase Realtime

### Menu Management

- CRUD for categories and products
- Upload product images (Supabase Storage)
- Manage variants per product
- Toggle availability (sold out)
- Link ingredients to products for auto inventory deduction

### Inventory Management

- Stock list with current vs minimum stock
- Color-coded low stock warnings
- Manual restock with quantity + cost
- View inventory logs/history
- Auto-deduct stock when order is completed

### Dashboard

- Today's sales total, order count, average order value
- Revenue chart (last 7 days or 30 days)
- Top selling products
- Low stock alerts widget
- Recent orders feed

### Reports

- Filter by date range
- Sales summary (gross, tax, net)
- Product performance table
- Export to CSV

---

## UI REQUIREMENTS

- Full **dark mode and light mode** support using Tailwind + CSS variables
- Use `next-themes` for theme switching
- All shadcn/ui components must respect the active theme
- Mobile-responsive POS layout (tablet-friendly for POS terminal)
- Sidebar collapses on mobile
- Use `cn()` utility for all conditional classnames
- Toast notifications for all actions (shadcn Sonner)

---

## AUTH & SECURITY

- Email + password login via Supabase Auth
- Middleware protects all `/dashboard/*` routes
- RLS policies on all tables scoped to authenticated users
- Service role key only used server-side
- All secrets in `.env.local`

---

## ENVIRONMENT VARIABLES

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## PACKAGES TO INSTALL

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npx shadcn@latest add button card input label table badge dialog sheet tabs select toast sonner

# Utilities
npm install next-themes zustand zod clsx tailwind-merge

# Charts
npm install recharts

# Forms
npm install react-hook-form @hookform/resolvers
```

---

## DEVELOPMENT ORDER (Step by Step)

1. Set up Next.js + Supabase + shadcn/ui
2. Create Supabase schema + RLS policies
3. Build auth (login page + middleware)
4. Build sidebar layout + theme toggle
5. Build cash session (open/close flow)
6. Build menu management (CRUD)
7. Build inventory management
8. Build POS terminal + cart (require active session)
9. Wire inventory deduction to orders
10. Build dashboard + charts
11. Build reports + CSV export

---

Start by scaffolding the project structure, setting up Supabase clients (browser + server), and creating the authentication flow. Then proceed module by module in the order listed above.
