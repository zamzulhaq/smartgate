-- Tes lokal log akses: INSERT boleh, UPDATE/DELETE ditolak, RLS membatasi.
-- Semua data uji dibalik (ROLLBACK). Jalankan sebagai role admin/CLI.

\set ON_ERROR_STOP on

begin;

insert into access_points (nama, tipe, lokasi)
values ('Gerbang Uji', 'gerbang', 'Lokasi Uji')
returning id as uji_ap_id \gset

insert into devices (access_point_id, arah, device_key_hash)
values (:'uji_ap_id', 'masuk', 'hash-uji')
returning id as uji_device_id \gset

select id as uji_resident_id from residents order by created_at limit 1 \gset

-- 1. Sebagai aplikasi dengan peran admin: INSERT berhasil.
set local role smartgate_app;
set local app.role = 'admin';

insert into access_logs
  (access_point_id, device_id, device_seq, arah, metode, resident_id, hasil, device_time)
values
  (:'uji_ap_id', :'uji_device_id', 1, 'masuk', 'manual', :'uji_resident_id', 'diizinkan', now());

do $$
begin
  if (select count(*) from access_logs) < 1 then
    raise exception 'GAGAL: admin tidak bisa membaca log';
  end if;
end $$;

-- 2. UPDATE dan DELETE harus ditolak walau app.role='admin' (tanpa grant).
do $$
begin
  begin
    update access_logs set hasil = 'ditolak';
    raise exception 'GAGAL: UPDATE log diizinkan';
  exception when insufficient_privilege then
    raise notice 'OK: UPDATE log ditolak';
  end;

  begin
    delete from access_logs;
    raise exception 'GAGAL: DELETE log diizinkan';
  exception when insufficient_privilege then
    raise notice 'OK: DELETE log ditolak';
  end;
end $$;

-- 3. Tanpa app.role: tidak bisa membaca dan tidak bisa insert (RLS).
reset role;
set local role smartgate_app;
set local app.role = '';

do $$
begin
  if (select count(*) from access_logs) <> 0 then
    raise exception 'GAGAL: tanpa app.role bisa membaca log';
  end if;
end $$;

do $$
begin
  begin
    insert into access_logs (device_seq, arah, metode, hasil, device_time)
    values (999, 'masuk', 'manual', 'diizinkan', now());
    raise exception 'GAGAL: tanpa app.role bisa INSERT log';
  exception when insufficient_privilege then
    raise notice 'OK: INSERT tanpa app.role ditolak';
  end;
end $$;

-- 4. Peran warga tidak boleh membaca log.
set local app.role = 'warga';
do $$
begin
  if (select count(*) from access_logs) <> 0 then
    raise exception 'GAGAL: peran warga bisa membaca log';
  end if;
end $$;

rollback;

\echo 'TES LOG AKSES LULUS: insert admin boleh, update/delete ditolak, RLS aktif.'
