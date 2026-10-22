-- 002_test_rls.sql
-- Tes sederhana: role tanpa izin TIDAK bisa membaca/mengubah data rumah & warga.
--
-- Jalankan dengan role ADMIN (setelah 001_houses_residents.sql):
--   psql -U <role admin> -h 127.0.0.1 -p 5433 -d smartgate -v ON_ERROR_STOP=1 -f migrations/002_test_rls.sql
--
-- Semua objek yang dibuat di tes ini (role uji + data uji) dibatalkan saat
-- ROLLBACK, jadi tes bisa diulang dan tidak meninggalkan jejak di database.

BEGIN;

-- Role uji: punya hak tabel yang sama seperti role aplikasi, TAPI tidak punya
-- policy RLS. Kalau RLS aktif, role ini tidak boleh melihat/mengubah data.
CREATE ROLE smartgate_no_access NOLOGIN;
GRANT SELECT, INSERT, UPDATE ON houses, residents TO smartgate_no_access;

-- Data uji (dibatalkan di akhir). Kedua tabel harus terisi supaya uji "tidak
-- bisa membaca" benar-benar berarti, bukan kebetulan tabelnya kosong.
INSERT INTO houses (blok, nomor, status_hunian) VALUES ('UJI', '1', 'kosong');
INSERT INTO residents (house_id, nama, status_keluarga)
SELECT id, 'Warga Uji', 'kepala_keluarga' FROM houses WHERE blok = 'UJI' AND nomor = '1';

-- 1) Role tanpa izin tidak boleh bisa membaca data.
SET LOCAL ROLE smartgate_no_access;

DO $$
DECLARE
    jml bigint;
BEGIN
    SELECT count(*) INTO jml FROM houses;
    IF jml <> 0 THEN
        RAISE EXCEPTION 'RLS GAGAL: role tanpa izin masih membaca % baris houses', jml;
    END IF;

    SELECT count(*) INTO jml FROM residents;
    IF jml <> 0 THEN
        RAISE EXCEPTION 'RLS GAGAL: role tanpa izin masih membaca % baris residents', jml;
    END IF;
END
$$;

-- 2) Role tanpa izin tidak boleh bisa mengubah data (0 baris terpengaruh).
DO $$
DECLARE
    jml bigint;
BEGIN
    UPDATE houses SET catatan = 'diubah oleh role tanpa izin';
    GET DIAGNOSTICS jml = ROW_COUNT;
    IF jml <> 0 THEN
        RAISE EXCEPTION 'RLS GAGAL: role tanpa izin mengubah % baris houses', jml;
    END IF;

    UPDATE residents SET nama = 'Diubah oleh role tanpa izin';
    GET DIAGNOSTICS jml = ROW_COUNT;
    IF jml <> 0 THEN
        RAISE EXCEPTION 'RLS GAGAL: role tanpa izin mengubah % baris residents', jml;
    END IF;
END
$$;

-- 3) Role tanpa izin tidak boleh bisa menambah data.
DO $$
BEGIN
    INSERT INTO houses (blok, nomor) VALUES ('UJI', '2');
    RAISE EXCEPTION 'RLS GAGAL: role tanpa izin berhasil menambah data houses';
EXCEPTION
    WHEN insufficient_privilege THEN NULL;
END
$$;

RESET ROLE;

-- 4) Kontrol positif: role aplikasi (dipakai web admin) boleh membaca.
SET LOCAL ROLE smartgate_app;

DO $$
DECLARE
    jml bigint;
BEGIN
    SELECT count(*) INTO jml FROM houses;
    IF jml = 0 THEN
        RAISE EXCEPTION 'Role aplikasi tidak bisa membaca houses - cek grant di 001';
    END IF;
END
$$;

RESET ROLE;

ROLLBACK;

\echo 'TES RLS LULUS: role tanpa izin tidak bisa membaca/mengubah/menambah data.'
