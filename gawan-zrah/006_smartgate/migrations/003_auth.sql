-- Autentikasi admin minimal untuk stack lokal (PRD bagian 7: tabel profiles).
-- Supabase Auth tidak dipakai lagi (lihat AGENTS.md keputusan arsitektur
-- 2026-10-22), jadi tabel profiles berfungsi sekaligus sebagai tabel akun:
-- kolom id/role/resident_id/nama mengikuti PRD, email + password_hash adalah
-- pengganti auth.users (hash scrypt, uid/password asli tidak pernah disimpan).
--
-- Peran mengikuti PRD bagian 2: admin, satpam, warga.

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('admin', 'satpam', 'warga')),
  resident_id uuid references residents (id),
  nama text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Akun hanya boleh dibaca oleh pemiliknya sendiri.
create policy profiles_read_own on profiles
  for select to smartgate_app
  using (id = nullif(current_setting('app.user_id', true), '')::uuid);

grant select on profiles to smartgate_app;

-- Pencarian akun saat login. SECURITY DEFINER supaya role aplikasi tidak perlu
-- akses penuh ke profiles (RLS tetap berlaku untuk semua jalur lain).
create or replace function app_login(p_email text)
returns table (id uuid, email text, password_hash text, role text, nama text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.email, p.password_hash, p.role, p.nama
  from profiles p
  where lower(p.email) = lower(p_email);
$$;

revoke execute on function app_login(text) from public;
grant execute on function app_login(text) to smartgate_app;

-- Policy houses/residents diganti dari permisif (USING true) menjadi berbasis
-- peran. Role aplikasi mengirim app.role per transaksi (lihat lib/db.ts
-- queryAs); kalau tidak diisi, akses ditolak.
drop policy if exists houses_app_admin on houses;
create policy houses_admin on houses
  for all to smartgate_app
  using (current_setting('app.role', true) = 'admin')
  with check (current_setting('app.role', true) = 'admin');

drop policy if exists residents_app_admin on residents;
create policy residents_admin on residents
  for all to smartgate_app
  using (current_setting('app.role', true) = 'admin')
  with check (current_setting('app.role', true) = 'admin');
