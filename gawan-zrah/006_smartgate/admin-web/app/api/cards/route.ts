import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { kodeError, queryAs } from "@/lib/db";
import { hashUidHmac, normalisasiUid, validasiUid } from "@/lib/uid";

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET() {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }

  try {
    const rows = await queryAs<{
      id: string;
      resident_id: string;
      label: string | null;
      status: string;
      revoked_at: string | null;
      created_at: string;
      nama: string;
    }>(
      { role: sesi.role, userId: sesi.profileId },
      `select c.id, c.resident_id, c.label, c.status, c.revoked_at, c.created_at, r.nama
       from cards c
       join residents r on r.id = c.resident_id
       order by c.created_at desc`,
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar kartu" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON" }, { status: 400 });
  }

  const residentId = typeof data.resident_id === "string" ? data.resident_id.trim() : "";
  const uid = typeof data.uid === "string" ? data.uid : "";
  const label = typeof data.label === "string" ? data.label.trim() : "";
  const status = typeof data.status === "string" ? data.status.trim() : "aktif";

  if (!POLA_UUID.test(residentId)) {
    return NextResponse.json({ error: "Pilih warga yang terdaftar" }, { status: 400 });
  }
  if (!validasiUid(uid)) {
    return NextResponse.json({ error: "Format UID tidak valid" }, { status: 400 });
  }
  if (status !== "aktif" && status !== "dicabut" && status !== "hilang") {
    return NextResponse.json({ error: "Status kartu tidak dikenal" }, { status: 400 });
  }

  const uidHmac = hashUidHmac(uid);
  // Jangan pernah log uid mentah; normalisasi dipakai hanya untuk validasi/hashing.
  const uidNorm = normalisasiUid(uid);
  void uidNorm;

  try {
    const rows = await queryAs<{
      id: string;
      resident_id: string;
      label: string | null;
      status: string;
      created_at: string;
    }>(
      { role: sesi.role, userId: sesi.profileId },
      `insert into cards (resident_id, uid_hmac, label, status, registered_by)
       values ($1, $2, $3, $4, $5)
       returning id, resident_id, label, status, created_at`,
      [residentId, uidHmac, label || null, status, sesi.profileId],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (kodeError(error) === "23505") {
      return NextResponse.json({ error: "UID kartu sudah terdaftar" }, { status: 409 });
    }
    if (kodeError(error) === "23503") {
      return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 400 });
    }
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("UID_HMAC_SECRET")) {
      return NextResponse.json({ error: "Konfigurasi server tidak lengkap" }, { status: 500 });
    }
    return NextResponse.json({ error: "Gagal mendaftarkan kartu" }, { status: 500 });
  }
}

