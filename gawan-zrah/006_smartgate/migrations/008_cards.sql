-- Fondasi manajemen kartu akses (PRD bagian 7: tabel cards)
-- UID tidak pernah disimpan mentah. Hanya uid_hmac (HMAC-SHA256) yang unik.
-- Agar aman di lokal, HMAC memakai secret dari environment via app.uid_hmac_secret
-- (di-set oleh aplikasi; secret tidak di-commit).

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references residents(id),
  uid_hmac text not null unique,
  label text,
  status text not null check (status in ('aktif', 'dicabut', 'hilang')),
  consent_at timestamptz,
  registered_by uuid references profiles(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_cards_resident_id on cards(resident_id);
create index if not exists idx_cards_status on cards(status);

alter table cards enable row level security;

-- Hanya admin yang boleh mengelola/melihat kartu (sesuai RLS PRD: satpam tidak
-- boleh melihat cards). Akses dibatasi oleh peran via app.role.
drop policy if exists cards_admin on cards;
create policy cards_admin on cards
  for all to smartgate_app
  using (current_setting('app.role', true) = 'admin')
  with check (current_setting('app.role', true) = 'admin');

grant select, insert, update on cards to smartgate_app;
