-- Khalis Global Export Portal — Phase 1 initial schema
-- Convention: UUID pk, created_at/updated_at timestamptz, restrict/cascade fks as documented
-- in docs/data-model.md. Every commercial/logistics field is nullable + verification_status.

create extension if not exists "pgcrypto";

create type verification_status as enum ('PENDING_VERIFICATION', 'VERIFIED');
create type product_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
create type business_type as enum (
  'DISTRIBUTOR', 'WHOLESALER', 'RETAILER', 'IMPORTER',
  'PRIVATE_LABEL', 'FRAGRANCE_BRAND', 'OTHER'
);
create type lead_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'ENTERPRISE');
create type rfq_status as enum ('NEW', 'QUALIFYING', 'QUOTED', 'NEGOTIATING', 'WON', 'LOST');
create type staff_role as enum ('SALES', 'MANAGER', 'ADMIN');
create type container_type as enum ('20FT', '40FT', '40FT_HC');

-- updated_at trigger helper --------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Catalogue -------------------------------------------------------------
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table categories ( -- independent B2B taxonomy, evolves separately from retail collections
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table collections ( -- mirrors current public-site retail collections initially
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  source text not null default 'khalisperfumes.com', -- provenance of the taxonomy label
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  slug text not null unique,
  brand_id uuid references brands(id) on delete restrict,
  name text not null,
  description text,
  fragrance_notes text,
  volume_ml integer,
  status product_status not null default 'DRAFT',
  logistics_status verification_status not null default 'PENDING_VERIFICATION',
  commercial_status verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_sku_idx on products(sku);
create index products_slug_idx on products(slug);
create index products_status_idx on products(status);

create table product_categories ( -- many-to-many products <-> categories
  product_id uuid not null references products(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  primary key (product_id, category_id)
);
create index product_categories_category_idx on product_categories(category_id);

create table collections_products (
  collection_id uuid not null references collections(id) on delete restrict,
  product_id uuid not null references products(id) on delete cascade,
  primary key (collection_id, product_id)
);
create index collections_products_collection_idx on collections_products(collection_id);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null, -- Supabase Storage path
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  variant_label text not null, -- e.g. size/concentration variant
  volume_ml integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Commercial / logistics (nullable, verification-gated) -----------------
create table packaging_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  packaging_type text,
  private_label_available boolean,
  verification_status verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table carton_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  units_per_carton integer,
  carton_length_cm numeric,
  carton_width_cm numeric,
  carton_height_cm numeric,
  carton_cbm numeric,
  carton_gross_weight_kg numeric,
  carton_net_weight_kg numeric,
  verification_status verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table logistics_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  moq_units integer,
  moq_cartons integer,
  pallet_quantity integer,
  container_type container_type,
  estimated_capacity_units integer,
  export_docs_available boolean,
  lead_time_days integer,
  verification_status verification_status not null default 'PENDING_VERIFICATION',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trust -------------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuing_body text,
  verification_status verification_status not null default 'PENDING_VERIFICATION',
  is_public boolean not null default false, -- must be true AND VERIFIED to render publicly
  document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table markets (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique, -- ISO 3166-1 alpha-2
  country_name text not null,
  is_active_export_market boolean not null default false,
  created_at timestamptz not null default now()
);
create index markets_country_idx on markets(country_code);

-- CRM / funnel --------------------------------------------------------------
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  business_type business_type,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  full_name text not null,
  email text,
  whatsapp text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table rfqs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete restrict,
  company_id uuid references companies(id) on delete set null,
  target_market text,
  container_interest container_type,
  private_label_requirement boolean,
  packaging_requirement text,
  shipping_preference text,
  message text,
  status rfq_status not null default 'NEW',
  lead_priority lead_priority, -- set server-side by lead_scores, never client-writable
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index rfqs_status_idx on rfqs(status);
create index rfqs_lead_priority_idx on rfqs(lead_priority);

create table rfq_items (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfqs(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  estimated_quantity integer,
  estimated_cartons integer,
  created_at timestamptz not null default now()
);

create table lead_scores (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfqs(id) on delete cascade,
  score integer not null,
  priority lead_priority not null,
  scored_by text not null default 'system', -- 'system' | staff user id
  created_at timestamptz not null default now()
);

create table quotes (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfqs(id) on delete restrict,
  status text not null default 'DRAFT',
  currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conversations / AI ----------------------------------------------------
create table whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  rfq_id uuid references rfqs(id) on delete set null,
  wa_conversation_id text, -- WhatsApp Business Cloud API conversation id
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  whatsapp_conversation_id uuid references whatsapp_conversations(id) on delete cascade,
  rfq_id uuid references rfqs(id) on delete set null,
  role text not null, -- 'user' | 'assistant' | 'system'
  content text not null,
  created_at timestamptz not null default now()
);

-- Platform ------------------------------------------------------------------
create table users ( -- internal staff, backed by Supabase Auth
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role staff_role not null default 'SALES',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references users(id) on delete set null,
  table_name text not null,
  row_id uuid not null,
  diff jsonb not null,
  created_at timestamptz not null default now()
);

-- updated_at triggers ---------------------------------------------------
do $$
declare t text;
begin
  for t in select unnest(array[
    'brands','categories','collections','products','product_variants',
    'packaging_specs','carton_specs','logistics_specs','certifications',
    'companies','contacts','rfqs','quotes','whatsapp_conversations','users'
  ])
  loop
    execute format(
      'create trigger set_updated_at before update on %I for each row execute function set_updated_at();', t
    );
  end loop;
end $$;

-- Public-safe view: only PUBLIC-tier columns, never commercial/confidential ---
create view public_products as
select
  p.id, p.sku, p.slug, p.name, p.description, p.fragrance_notes,
  p.volume_ml, p.status, b.name as brand_name
from products p
left join brands b on b.id = p.brand_id
where p.status = 'PUBLISHED';

-- Row Level Security ------------------------------------------------------
alter table brands enable row level security;
alter table categories enable row level security;
alter table collections enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table collections_products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table packaging_specs enable row level security;
alter table carton_specs enable row level security;
alter table logistics_specs enable row level security;
alter table documents enable row level security;
alter table certifications enable row level security;
alter table markets enable row level security;
alter table companies enable row level security;
alter table contacts enable row level security;
alter table rfqs enable row level security;
alter table rfq_items enable row level security;
alter table lead_scores enable row level security;
alter table quotes enable row level security;
alter table whatsapp_conversations enable row level security;
alter table ai_messages enable row level security;
alter table users enable row level security;
alter table audit_logs enable row level security;

-- Public read access: catalogue metadata only (raw tables), not commercial tables.
-- Product detail pages should prefer the public_products view; these policies exist so
-- server code can still join brand/category/collection labels safely.
create policy "public read brands" on brands for select using (true);
create policy "public read categories" on categories for select using (true);
create policy "public read collections" on collections for select using (true);
create policy "public read published products" on products
  for select using (status = 'PUBLISHED');
create policy "public read product_categories" on product_categories for select using (true);
create policy "public read collections_products" on collections_products for select using (true);
create policy "public read product_images" on product_images for select using (true);
create policy "public read product_variants" on product_variants for select using (true);
create policy "public read verified public certifications" on certifications
  for select using (is_public = true and verification_status = 'VERIFIED');
create policy "public read markets" on markets for select using (is_active_export_market = true);

-- No anon policy is created for: packaging_specs, carton_specs, logistics_specs, documents,
-- companies, contacts, rfqs, rfq_items, lead_scores, quotes, whatsapp_conversations,
-- ai_messages, users, audit_logs. Default-deny applies; access is via the service role
-- from server-only code (see docs/security.md), or authenticated staff policies below.

create policy "staff read own user row" on users
  for select using (auth.uid() = id);
create policy "manager admin read all users" on users
  for select using (
    exists (select 1 from users u where u.id = auth.uid() and u.role in ('MANAGER','ADMIN'))
  );
