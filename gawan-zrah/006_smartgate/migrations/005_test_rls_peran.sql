-- Versi baru migrasi 002: verifikasi RLS peran setelah pengamanan.
-- Data uji dibalik (rollback).

\set ON_ERROR_STOP on
begin;

insert into houses (blok, nomor, status_hunian) values ('Z', '88', 'kosong');

set local role smartgate_app;
-- tanpa app.role harus ditolak
do $$
begin
  if (select count(*) from houses) <> 0 then raise exception 'RLS GAGAL: tanpa app.role boleh membaca'; end if;
end $$;
-- warga ditolak
set local app.role = 'warga';
do $$
begin
  if (select count(*) from houses) <> 0 then raise exception 'RLS GAGAL: warga boleh membaca houses'; end if;
end $$;
-- admin boleh
set local app.role = 'admin';
do $$
begin
  if (select count(*) from houses) = 0 then raise exception 'RLS GAGAL: admin tidak bisa membaca houses'; end if;
end $$;

reset role;
rollback;
\echo TES RLS PERAN AKTIF: tanpa peran/role non-admin ditolak, admin diizinkan.
