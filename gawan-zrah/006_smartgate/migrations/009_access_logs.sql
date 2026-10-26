-- Fondasi log akses gerbang (PRD bagian 7: access_points, devices, access_logs).
-- access_logs bersifat INSERT-ONLY untuk role aplikasi: hanya SELECT + INSERT
-- yang di-grant. Tidak ada UPDATE/DELETE, dan tidak ada policy untuk itu.
-- Tidak ada UID mentah; log hanya menyimpan card_id (uuid).

create table if not exists access_points (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  tipe text not null check (tipe in ('gerbang', 'gor', 'gedung')),
  lokasi text,
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists devices (
  id uuid primary key default gen_random_uuid(),
  access_point_id uuid not null references access_points(id),
  arah text not null check (arah in ('masuk', 'keluar', 'pendaftaran')),
  device_key_hash text,
  last_seen timestamptz,
  last_sync_version bigint not null default 0,
  firmware text,
  created_at timestamptz not null default now()
);

create table if not exists access_logs (
  id uuid primary key default gen_random_uuid(),
  access_point_id uuid references access_points(id),
  device_id uuid references devices(id),
  device_seq bigint not null,
  arah text not null check (arah in ('masuk', 'keluar', 'pendaftaran')),
  metode text not null check (metode in ('kartu', 'qr', 'manual')),
  card_id uuid references cards(id),
  guest_id uuid, -- tabel guests belum ada; disimpan tanpa FK untuk sekarang
  resident_id uuid references residents(id),
  hasil text not null check (hasil in ('diizinkan', 'ditolak')),
  alasan_tolak text,
  opened_by uuid references profiles(id),
  device_time timestamptz not null,
  server_time timestamptz not null default now(),
  unique (device_id, device_seq)
);

create index if not exists idx_access_logs_server_time on access_logs(server_time desc);
create index if not exists idx_access_logs_resident_id on access_logs(resident_id);
create index if not exists idx_access_logs_card_id on access_logs(card_id);

alter table access_points enable row level security;
alter table devices enable row level security;
alter table access_logs enable row level security;

drop policy if exists access_points_admin on access_points;
create policy access_points_admin on access_points
  for select to smartgate_app
  using (current_setting('app.role', true) = 'admin');

drop policy if exists devices_admin on devices;
create policy devices_admin on devices
  for select to smartgate_app
  using (current_setting('app.role', true) = 'admin');

drop policy if exists access_logs_admin_select on access_logs;
create policy access_logs_admin_select on access_logs
  for select to smartgate_app
  using (current_setting('app.role', true) = 'admin');

drop policy if exists access_logs_admin_insert on access_logs;
create policy access_logs_admin_insert on access_logs
  for insert to smartgate_app
  with check (current_setting('app.role', true) = 'admin');

grant select on access_points, devices to smartgate_app;
-- Sengaja tanpa update/delete: log akses tidak boleh diubah/dihapus.
grant select, insert on access_logs to smartgate_app;
