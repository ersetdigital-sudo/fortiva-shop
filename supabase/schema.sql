-- ============================================================================
-- Fortiva Shop — Skema Database (Supabase / PostgreSQL)
-- Jalankan sekali di project: eammwzuhoezhmwhlmdqy
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: trigger updated_at
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- ADMIN ALLOWLIST
-- Hanya user yang terdaftar di sini yang dianggap admin.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- PENGATURAN SITUS (key-value)
-- Dipakai untuk: nomor WhatsApp CS, gambar QRIS, teks banner, dsb.
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      text not null default '',
  label      text not null default '',
  group_name text not null default 'umum',
  sort_order int  not null default 0,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_settings_updated on public.settings;
create trigger trg_settings_updated
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- KATEGORI
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  name              text not null,
  label             text not null,
  input_label       text not null default '',
  input_placeholder text not null default '',
  helper_text       text not null default '',
  icon              text,
  image_url         text,
  sort_order        int  not null default 0,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- PROVIDER / OPERATOR
-- ---------------------------------------------------------------------------
create table if not exists public.providers (
  id            uuid primary key default gen_random_uuid(),
  category_slug text not null references public.categories (slug) on delete cascade,
  name          text not null,
  code          text not null,
  short_name    text not null default '',
  bg_color      text not null default '#111827',
  text_color    text not null default '#FFFFFF',
  logo_url      text,
  sort_order    int  not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (category_slug, code)
);

drop trigger if exists trg_providers_updated on public.providers;
create trigger trg_providers_updated
  before update on public.providers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- PRODUK / NOMINAL
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  category_slug text not null references public.categories (slug) on delete cascade,
  provider_code text,
  label         text not null,
  description   text not null default '',
  price         numeric(14, 2) not null default 0,
  badge         text check (badge is null or badge in ('POPULER', 'HEMAT', 'PROMO')),
  image_url     text,
  is_active     boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_products_category on public.products (category_slug) where is_active;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated
  before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- PESANAN
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  category_slug  text,
  category_name  text not null default '',
  provider_name  text not null default '',
  nominal_label  text not null default '',
  destination    text not null,
  total_price    numeric(14, 2) not null default 0,
  admin_fee      numeric(14, 2) not null default 0,
  status         text not null default 'PENDING_PAYMENT'
                 check (status in (
                   'PENDING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED',
                   'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED'
                 )),
  serial_number  text,
  token_pln      text,
  customer_note  text,
  payment_method text not null default 'QRIS Standar Nasional',
  -- Jejak audit verifikasi pembayaran (diisi bertahap oleh admin).
  payment_reported_at timestamptz,
  verified_at    timestamptz,
  processed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_orders_created on public.orders (created_at desc);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_invoice on public.orders (invoice_number);

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- MIGRASI STATUS PEMBAYARAN (aman dijalankan berulang)
--
-- Alur status:
--   PENDING_PAYMENT      -> pelanggan belum melaporkan pembayaran
--   WAITING_VERIFICATION -> pelanggan menekan "Saya Sudah Bayar"
--   VERIFIED             -> admin memastikan dana masuk
--   PROCESSING           -> produk sedang dikirim ke biller
--   SUCCESS              -> serial / token sudah terkirim
--   FAILED               -> pembayaran tidak ditemukan / ditolak
--   EXPIRED              -> QRIS kedaluwarsa sebelum dibayar
-- ---------------------------------------------------------------------------
alter table public.orders add column if not exists payment_reported_at timestamptz;
alter table public.orders add column if not exists verified_at timestamptz;
alter table public.orders add column if not exists processed_at timestamptz;

-- Status lama 'PENDING' artinya pelanggan belum membayar.
update public.orders set status = 'PENDING_PAYMENT' where status = 'PENDING';

alter table public.orders alter column status set default 'PENDING_PAYMENT';
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in (
    'PENDING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED',
    'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED'
  ));

-- ---------------------------------------------------------------------------
-- STATISTIK DASHBOARD ADMIN
-- Dipanggil dari server memakai service role (execute dicabut dari publik).
-- ---------------------------------------------------------------------------
create or replace function public.admin_dashboard_stats()
returns json
language sql
stable
security definer
set search_path to 'public'
as $function$
  select json_build_object(
    'orders_total',  (select count(*) from public.orders),
    'orders_today',  (select count(*) from public.orders where created_at >= date_trunc('day', now())),
    -- "Menunggu diproses" = belum dibayar + sudah dilaporkan tapi belum diverifikasi.
    'orders_pending', (select count(*) from public.orders where status in ('PENDING_PAYMENT', 'WAITING_VERIFICATION')),
    'orders_waiting_verification', (select count(*) from public.orders where status = 'WAITING_VERIFICATION'),
    'orders_verified', (select count(*) from public.orders where status = 'VERIFIED'),
    'orders_processing', (select count(*) from public.orders where status = 'PROCESSING'),
    'orders_failed', (select count(*) from public.orders where status in ('FAILED', 'EXPIRED')),
    'orders_success', (select count(*) from public.orders where status = 'SUCCESS'),
    'revenue_total', (select coalesce(sum(total_price), 0) from public.orders where status = 'SUCCESS'),
    'revenue_today', (select coalesce(sum(total_price), 0) from public.orders where status = 'SUCCESS' and created_at >= date_trunc('day', now())),
    'products_active', (select count(*) from public.products where is_active),
    'products_total', (select count(*) from public.products),
    'categories_active', (select count(*) from public.categories where is_active),
    'providers_active', (select count(*) from public.providers where is_active),
    'bank_accounts_active', (select count(*) from public.bank_accounts where is_active)
  );
$function$;

revoke execute on function public.admin_dashboard_stats() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- REKENING BANK
-- ---------------------------------------------------------------------------
create table if not exists public.bank_accounts (
  id             uuid primary key default gen_random_uuid(),
  bank_name      text not null,
  account_number text not null,
  account_name   text not null,
  logo_url       text,
  sort_order     int not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

drop trigger if exists trg_bank_accounts_updated on public.bank_accounts;
create trigger trg_bank_accounts_updated
  before update on public.bank_accounts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- Publik  : hanya boleh BACA data katalog & pengaturan.
-- Admin   : full akses via service role (route handler server) atau sesi admin.
-- ============================================================================
alter table public.settings      enable row level security;
alter table public.categories    enable row level security;
alter table public.providers     enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.admin_users   enable row level security;

-- ---- settings ----
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings for select to anon, authenticated using (true);

drop policy if exists "settings_admin_write" on public.settings;
create policy "settings_admin_write" on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- categories ----
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select to anon, authenticated using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- providers ----
drop policy if exists "providers_public_read" on public.providers;
create policy "providers_public_read" on public.providers for select to anon, authenticated using (true);

drop policy if exists "providers_admin_write" on public.providers;
create policy "providers_admin_write" on public.providers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- products ----
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select to anon, authenticated using (true);

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- bank_accounts ----
drop policy if exists "bank_accounts_public_read" on public.bank_accounts;
create policy "bank_accounts_public_read" on public.bank_accounts for select to anon, authenticated using (true);

drop policy if exists "bank_accounts_admin_write" on public.bank_accounts;
create policy "bank_accounts_admin_write" on public.bank_accounts for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- orders: TIDAK boleh dibaca publik (data pribadi) ----
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---- admin_users: hanya admin yang bisa lihat ----
drop policy if exists "admin_users_self_read" on public.admin_users;
create policy "admin_users_self_read" on public.admin_users for select to authenticated
  using (public.is_admin() or user_id = auth.uid());

-- ============================================================================
-- SEED DATA
-- ============================================================================

insert into public.settings (key, value, label, group_name, sort_order) values
  ('site_name',            'Fortiva Shop',                                   'Nama Situs',            'umum', 1),
  ('whatsapp_cs',          '6281234567890',                                  'Nomor WhatsApp CS',     'kontak', 1),
  ('whatsapp_label',       'CS WhatsApp · 08.00–22.00 WIB',                  'Label Jam CS',          'kontak', 2),
  ('qris_image_url',       '',                                               'Gambar QRIS',           'pembayaran', 1),
  ('qris_merchant',        'Fortiva Shop',                                   'Nama Merchant QRIS',    'pembayaran', 2),
  ('payment_instructions', 'Scan QRIS dengan aplikasi bank atau e-wallet apa pun. Setelah membayar, tekan tombol konfirmasi agar laporan pembayaran kamu diperiksa tim kami.', 'Instruksi Pembayaran', 'pembayaran', 3),
  ('announcement',         'GATEWAY PPOB AKTIF 24 JAM',                      'Teks Badge Hero',       'umum', 2),
  ('hero_title',           'Urus Tagihan & Isi Saldo,',                      'Judul Hero Baris 1',    'umum', 3),
  ('hero_title_accent',    'Tanpa Ribet.',                                   'Judul Hero Baris 2',    'umum', 4),
  ('hero_subtitle',        'Dari pulsa dan paket data hingga token listrik PLN dan tagihan rutin — semua dalam satu tempat, dibayar praktis pakai QRIS.', 'Subjudul Hero', 'umum', 5),
  ('support_email',        'cs@fortivashop.id',                              'Email Dukungan',        'kontak', 3)
on conflict (key) do nothing;

insert into public.categories (slug, name, label, input_label, input_placeholder, helper_text, icon, sort_order) values
  ('pulsa',   'Pulsa Reguler',                'Pulsa',         'Nomor Handphone',                    '08xxxxxxxxxx',                  'Pastikan nomor ponsel aktif untuk menerima serial number (SN).', 'pulsa', 1),
  ('data',    'Paket Data Kuota',             'Paket Data',    'Nomor Handphone',                    '08xxxxxxxxxx',                  'Kuota langsung aktif 24 jam setelah pembayaran QRIS diverifikasi.', 'data', 2),
  ('pln',     'Token Listrik PLN',            'Token PLN',     'Nomor Meter / ID Pelanggan PLN',     '14xxxxxxxxxx / 5xxxxxxxxxxx',   '20 digit token muncul di halaman status setelah pembayaran diverifikasi.', 'pln', 3),
  ('ewallet', 'Top Up E-Wallet',              'E-Wallet',      'Nomor Ponsel Akun E-Wallet',         '08xxxxxxxxxx',                  'Saldo dikirim ke akun tujuan setelah pembayaran QRIS diverifikasi.', 'ewallet', 4),
  ('tagihan', 'Tagihan Rutin & Bulanan',      'Tagihan Rutin', 'Nomor Pelanggan / ID Tagihan',       'Masukkan nomor kontrak / ID tagihan...', 'Periksa kembali data nama dan tagihan pokok sebelum menyelesaikan pembayaran.', 'tagihan', 5)
on conflict (slug) do nothing;

insert into public.providers (category_slug, name, code, short_name, bg_color, text_color, sort_order) values
  ('pulsa',   'Telkomsel', 'TSEL', 'T', '#F2352B', '#FFFFFF', 1),
  ('pulsa',   'Indosat',   'ISAT', 'ISAT', '#F59E0B', '#FFFFFF', 2),
  ('pulsa',   'XL Axiata', 'XL',   'XL', '#245BE8', '#FFFFFF', 3),
  ('pulsa',   'Tri',       'TRI',  '3', '#111827', '#FFFFFF', 4),
  ('pulsa',   'Smartfren', 'SF',   'SF', '#E11D48', '#FFFFFF', 5),
  ('data',    'Telkomsel', 'TSEL', 'T', '#F2352B', '#FFFFFF', 1),
  ('data',    'Indosat',   'ISAT', 'ISAT', '#F59E0B', '#FFFFFF', 2),
  ('data',    'XL Axiata', 'XL',   'XL', '#245BE8', '#FFFFFF', 3),
  ('data',    'Tri',       'TRI',  '3', '#111827', '#FFFFFF', 4),
  ('data',    'Smartfren', 'SF',   'SF', '#E11D48', '#FFFFFF', 5),
  ('pln',     'PLN Prabayar',   'PLN_PRA',   '⚡', '#245BE8', '#FFE78F', 1),
  ('pln',     'PLN Pascabayar', 'PLN_PASCA', '💡', '#111827', '#FFFFFF', 2),
  ('ewallet', 'GoPay',     'GOPAY', 'G', '#00AED6', '#FFFFFF', 1),
  ('ewallet', 'DANA',      'DANA',  'D', '#118EEA', '#FFFFFF', 2),
  ('ewallet', 'OVO',       'OVO',   'O', '#4C3494', '#FFFFFF', 3),
  ('ewallet', 'ShopeePay', 'SPAY',  'S', '#EE4D2D', '#FFFFFF', 4),
  ('ewallet', 'LinkAja',   'LINK',  'LA', '#ED1C24', '#FFFFFF', 5),
  ('tagihan', 'BPJS Kesehatan', 'BPJS', 'BPJS', '#059669', '#FFFFFF', 1),
  ('tagihan', 'PDAM',           'PDAM', 'PDAM', '#0284C7', '#FFFFFF', 2),
  ('tagihan', 'IndiHome',       'INDI', 'INDI', '#DC2626', '#FFFFFF', 3),
  ('tagihan', 'Multifinance',   'FIN',  'FIN', '#4B5563', '#FFFFFF', 4)
on conflict (category_slug, code) do nothing;

insert into public.products (category_slug, provider_code, label, description, price, badge, sort_order) values
  ('pulsa', 'TSEL', '5.000',   'Aktif +3 hari',  6000,   null, 1),
  ('pulsa', 'TSEL', '10.000',  'Aktif +7 hari',  11000,  null, 2),
  ('pulsa', 'TSEL', '25.000',  'Aktif +30 hari', 25750,  'POPULER', 5),
  ('pulsa', 'TSEL', '100.000', 'Aktif +60 hari', 99500,  'HEMAT', 7),
  ('data',  'TSEL', '3 GB / 30 Hari',   'Reguler semua jaringan 24 jam', 18500, null, 1),
  ('data',  'TSEL', '14 GB / 30 Hari',  'Tanpa batas kuota aplikasi',    54000, 'POPULER', 3),
  ('data',  'TSEL', '50 GB / 30 Hari',  'Termasuk langganan streaming',  125000, 'HEMAT', 5),
  ('pln',   null,   '20.000',  'Stroom ~13.5 kWh',  22500,  null, 1),
  ('pln',   null,   '100.000', 'Stroom ~69.2 kWh',  102500, 'POPULER', 3),
  ('pln',   null,   '500.000', 'Stroom ~348.0 kWh', 502500, 'HEMAT', 5),
  ('ewallet', null, '20.000',  'Masuk penuh tanpa potongan', 20500,  null, 1),
  ('ewallet', null, '50.000',  'Masuk penuh tanpa potongan', 50500,  'POPULER', 2),
  ('ewallet', null, '500.000', 'Masuk penuh tanpa potongan', 500500, 'HEMAT', 6),
  ('tagihan', null, 'Cek & Bayar Tagihan', 'Sistem cek inquiry realtime', 75000, 'POPULER', 1),
  ('tagihan', null, 'Tagihan 1 Bulan',     'Periode berjalan saat ini',   125000, null, 2)
on conflict do nothing;

insert into public.bank_accounts (bank_name, account_number, account_name, sort_order) values
  ('BCA',     '1234567890', 'PT Fortiva Digital Nusantara', 1),
  ('Mandiri', '0987654321', 'PT Fortiva Digital Nusantara', 2),
  ('BRI',     '1122334455', 'PT Fortiva Digital Nusantara', 3)
on conflict do nothing;
