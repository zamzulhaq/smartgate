-- MVP tamu tanpa QR: profil tamu dikenali dari HMAC NIK (secret terpisah dari
-- UID_HMAC_SECRET). NIK tidak pernah disimpan/ditampilkan mentah. Setiap
-- kedatangan dicatat sebagai satu baris guest_visits dengan rumah tujuan,
-- waktu, dan petugas pencatat.

create table if not exists guests (
  id uuid primary key default gen_random_uuid(),
  nik_hmac text not null unique,
  nama text not null,
  catatan text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists guest_visits (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references guests(id),
  house_id uuid not null references houses(id),
  keperluan text,
  dicatat_oleh uuid not null references profiles(id),
  waktu_datang timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_guest_visits_guest_id on guest_visits(guest_id);
create index if not exists idx_guest_visits_house_id on guest_visits(house_id);
create index if not exists idx_guest_visits_waktu on guest_visits(waktu_datang desc);

alter table guests enable row level security;
alter table guest_visits enable row level security;

drop policy if exists guests_admin on guests;
create policy guests_admin on guests
  for select to smartgate_app
  using (current_setting('app.role', true) = 'admin');

drop policy if exists guests_admin_insert on guests;
create policy guests_admin_insert on guests
  for insert to smartgate_app
  with check (current_setting('app.role', true) = 'admin');

drop policy if exists guest_visits_admin on guest_visits;
create policy guest_visits_admin on guest_visits
  for select to smartgate_app
  using (current_setting('app.role', true) = 'admin');

drop policy if exists guest_visits_admin_insert on guest_visits;
create policy guest_visits_admin_insert on guest_visits
  for insert to smartgate_app
  with check (current_setting('app.role', true) = 'admin');

-- Aplikasi hanya butuh baca + tambah; tidak ada update/delete untuk MVP ini.
grant select, insert on guests, guest_visits to smartgate_app;

-- Relasi access_logs.guest_id ke guests (log lama tetap; nilainya null).
alter table access_logs drop constraint if exists access_logs_guest_id_fkey;
alter table access_logs
  add constraint access_logs_guest_id_fkey foreign key (guest_id) references guests(id);
