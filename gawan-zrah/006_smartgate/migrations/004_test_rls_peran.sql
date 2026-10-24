-- Tes RLS berbasis peran (migrasi 003). Dijalankan sebagai role admin/CLI.
-- Semua perubahan dibalik (rollback) di akhir, jadi data uji tidak tertinggal.

\set ON_ERROR_STOP on

begin;

create role smartgate_no_access nologin;
grant select, insert, update on houses, residents, profiles to smartgate_no_access;

insert into profiles (email, password_hash, role, nama)
values ('uji-admin@contoh.local', 'uji', 'admin', 'Uji Admin'),
       ('uji-warga@contoh.local', 'uji', 'warga', 'Uji Warga');
select id as uji_admin_id from profiles where email = 'uji-admin@contoh.local' \gset

insert into houses (blok, nomor, status_hunian) values ('Z', '99', 'kosong');
insert into residents (house_id, nama, status_keluarga)
select id, 'Warga Uji RLS', 'anak' from houses where blok = 'Z' and nomor = '99';

-- 1. Role tanpa hak GRANT sama sekali tidak bisa membaca data.
set local role smartgate_no_access;
do $$
begin
  if (select count(*) from houses) <> 0 then
    raise exception 'RLS GAGAL: role tanpa akses membaca houses';
  end if;
  if (select count(*) from residents) <> 0 then
    raise exception 'RLS GAGAL: role tanpa akses membaca residents';
  end if;
  if (select count(*) from profiles) <> 0 then
    raise exception 'RLS GAGAL: role tanpa akses membaca profiles';
  end if;
end $$;
reset role;

-- 2. Role aplikasi tanpa app.role ditolak (tolak by default).
set local role smartgate_app;
do $$
begin
  if (select count(*) from houses) <> 0 then
    raise exception 'RLS GAGAL: tanpa app.role masih bisa membaca houses';
  end if;
  if (select count(*) from residents) <> 0 then
    raise exception 'RLS GAGAL: tanpa app.role masih bisa membaca residents';
  end if;
end $$;
reset role;

-- 3. Peran selain admin tidak boleh menyentuh data rumah/warga.
set local role smartgate_app;
set local app.role = 'warga';
do $$
begin
  if (select count(*) from houses) <> 0 then
    raise exception 'RLS GAGAL: peran warga bisa membaca houses';
  end if;
  if (select count(*) from residents) <> 0 then
    raise exception 'RLS GAGAL: peran warga bisa membaca residents';
  end if;
end $$;
reset role;

-- 4. Admin boleh membaca dan menulis data rumah/warga.
set local role smartgate_app;
set local app.role = 'admin';
do $$
begin
  if (select count(*) from houses) = 0 then
    raise exception 'RLS GAGAL: admin tidak bisa membaca houses';
  end if;
  if (select count(*) from residents) = 0 then
    raise exception 'RLS GAGAL: admin tidak bisa membaca residents';
  end if;
end $$;
reset role;

-- 5. profiles hanya bisa dibaca akun sendiri.
set local role smartgate_app;
set local app.role = 'admin';
set local app.user_id = :'uji_admin_id';
do $$
begin
  if (select count(*) from profiles) <> 1 then
    raise exception 'RLS GAGAL: profiles tidak terbatas ke akun sendiri';
  end if;
end $$;
reset role;

rollback;

\echo 'TES RLS PERAN LULUS: tanpa login ditolak, non-admin ditolak, admin boleh, profiles terbatas.'
