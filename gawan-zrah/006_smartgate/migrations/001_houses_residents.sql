-- 001_houses_residents.sql
-- Tabel rumah dan warga sesuai PRD v0.2 bagian 3.1 dan bagian 7.
--
-- Jalankan dengan role ADMIN (ADMIN_DATABASE_URL di .env), bukan role aplikasi:
--   psql -U <role admin> -h 127.0.0.1 -p 5433 -d smartgate -v ON_ERROR_STOP=1 -f migrations/001_houses_residents.sql
--
-- Kolom id uuid + created_at timestamptz untuk semua tabel (PRD bagian 7).

CREATE TABLE houses (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    blok         text NOT NULL,
    nomor        text NOT NULL,
    status_hunian text NOT NULL DEFAULT 'kosong'
                 CHECK (status_hunian IN ('pemilik', 'kontrak', 'kosong')),
    catatan      text,
    created_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT houses_blok_nomor_unik UNIQUE (blok, nomor)
);

CREATE TABLE residents (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id        uuid NOT NULL REFERENCES houses (id),
    nama            text NOT NULL,
    status_keluarga text NOT NULL
                    CHECK (status_keluarga IN ('kepala_keluarga', 'pasangan', 'anak', 'art', 'lainnya')),
    no_hp           text,
    aktif           boolean NOT NULL DEFAULT true,
    created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX residents_house_id_idx ON residents (house_id);

-- Row Level Security aktif untuk kedua tabel.
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

-- Kebijakan sementara untuk pengujian admin lokal.
-- Identitas admin (login) belum ada, jadi yang boleh akses hanya role aplikasi
-- web admin. Role lain tidak punya policy apa pun -> RLS menolak (default deny).
-- Jangan tambah policy untuk warga/satpam sekarang: belum ada identitas
-- pengguna untuk memblokir/meloloskan baris dengan benar.
CREATE POLICY houses_app_admin ON houses
    FOR ALL TO smartgate_app USING (true) WITH CHECK (true);

CREATE POLICY residents_app_admin ON residents
    FOR ALL TO smartgate_app USING (true) WITH CHECK (true);

-- Hak minimum role aplikasi untuk web admin (sekarang: lihat + tambah).
GRANT SELECT, INSERT ON houses, residents TO smartgate_app;
