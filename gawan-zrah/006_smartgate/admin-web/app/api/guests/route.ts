import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { kodeError, queryAs } from "@/lib/db";
import { hashNikHmac, validasiNik } from "@/lib/nik";

type GuestRingkas = {
  id: string;
  nama: string;
};

export async function GET() {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin" && sesi.role !== "satpam") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }

  try {
    const rows = await queryAs<{
      id: string;
      nama: string;
      jumlah_kunjungan: number;
      terakhir_datang: string | null;
    }>(
      { role: sesi.role, userId: sesi.profileId },
      `select g.id, g.nama, count(v.id)::int as jumlah_kunjungan,
              max(v.waktu_datang) as terakhir_datang
       from guests g
       left join guest_visits v on v.guest_id = g.id
       group by g.id, g.nama, g.created_at
       order by g.created_at desc`,
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar tamu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin" && sesi.role !== "satpam") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON" }, { status: 400 });
  }

  const nama = typeof data.nama === "string" ? data.nama.trim() : "";
  const nik = typeof data.nik === "string" ? data.nik : "";

  if (!nama) {
    return NextResponse.json({ error: "Nama tamu wajib diisi" }, { status: 400 });
  }
  if (!validasiNik(nik)) {
    return NextResponse.json({ error: "NIK harus 16 digit" }, { status: 400 });
  }

  try {
    const nikHmac = hashNikHmac(nik);
    const user = { role: sesi.role, userId: sesi.profileId };

    const lama = await queryAs<GuestRingkas>(
      user,
      "select id, nama from guests where nik_hmac = $1",
      [nikHmac],
    );
    if (lama.length > 0) {
      return NextResponse.json({ ...lama[0], duplikat: true });
    }

    const baru = await queryAs<GuestRingkas>(
      user,
      "insert into guests (nik_hmac, nama, created_by) values ($1, $2, $3) returning id, nama",
      [nikHmac, nama, sesi.profileId],
    );
    return NextResponse.json({ ...baru[0], duplikat: false }, { status: 201 });
  } catch (error) {
    if (kodeError(error) === "23505") {
      return NextResponse.json(
        { error: "Tamu dengan NIK ini sudah terdaftar, gunakan data yang ada" },
        { status: 409 },
      );
    }
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("NIK_HMAC_SECRET")) {
      return NextResponse.json({ error: "Konfigurasi server tidak lengkap" }, { status: 500 });
    }
    return NextResponse.json({ error: "Gagal menyimpan data tamu" }, { status: 500 });
  }
}
