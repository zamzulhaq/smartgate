import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { kodeError, queryAs } from "@/lib/db";

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
      guest_id: string;
      nama_tamu: string;
      blok: string;
      nomor: string;
      keperluan: string | null;
      petugas: string;
      waktu_datang: string;
    }>(
      { role: sesi.role, userId: sesi.profileId },
      `select v.id, v.guest_id, g.nama as nama_tamu, h.blok, h.nomor,
              v.keperluan, p.nama as petugas, v.waktu_datang
       from guest_visits v
       join guests g on g.id = v.guest_id
       join houses h on h.id = v.house_id
       join profiles p on p.id = v.dicatat_oleh
       order by v.waktu_datang desc
       limit 100`,
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca kunjungan tamu" }, { status: 500 });
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

  const guestId = typeof data.guest_id === "string" ? data.guest_id.trim() : "";
  const houseId = typeof data.house_id === "string" ? data.house_id.trim() : "";
  const keperluan = typeof data.keperluan === "string" ? data.keperluan.trim() : "";

  if (!POLA_UUID.test(guestId) || !POLA_UUID.test(houseId)) {
    return NextResponse.json({ error: "Pilih tamu dan rumah tujuan" }, { status: 400 });
  }

  try {
    const rows = await queryAs<{ id: string; waktu_datang: string }>(
      { role: sesi.role, userId: sesi.profileId },
      `insert into guest_visits (guest_id, house_id, keperluan, dicatat_oleh)
       values ($1, $2, $3, $4)
       returning id, waktu_datang`,
      [guestId, houseId, keperluan || null, sesi.profileId],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (kodeError(error) === "23503") {
      return NextResponse.json({ error: "Tamu atau rumah tujuan tidak ditemukan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal mencatat kunjungan" }, { status: 500 });
  }
}
