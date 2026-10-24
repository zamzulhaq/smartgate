import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { kodeError, queryAs } from "@/lib/db";
import { STATUS_KELUARGA, type StatusKeluarga, type Warga } from "@/lib/types";

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
    const rows = await queryAs<Warga>(
      { role: sesi.role, userId: sesi.profileId },
      "select id, house_id, nama, status_keluarga, no_hp, aktif from residents order by nama",
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar warga" }, { status: 500 });
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

  const houseId = typeof data.house_id === "string" ? data.house_id.trim() : "";
  const nama = typeof data.nama === "string" ? data.nama.trim() : "";
  const status = typeof data.status_keluarga === "string" ? data.status_keluarga.trim() : "";
  const noHp = typeof data.no_hp === "string" ? data.no_hp.trim() : "";

  if (!POLA_UUID.test(houseId)) {
    return NextResponse.json({ error: "Pilih rumah yang terdaftar" }, { status: 400 });
  }
  if (!nama) {
    return NextResponse.json({ error: "Nama warga wajib diisi" }, { status: 400 });
  }
  if (!STATUS_KELUARGA.includes(status as StatusKeluarga)) {
    return NextResponse.json({ error: "Status keluarga tidak dikenal" }, { status: 400 });
  }

  try {
    const rows = await queryAs<Warga>(
      { role: sesi.role, userId: sesi.profileId },
      "insert into residents (house_id, nama, status_keluarga, no_hp, aktif) values ($1, $2, $3, $4, $5) returning id, house_id, nama, status_keluarga, no_hp, aktif",
      [houseId, nama, status, noHp || null, typeof data.aktif === "boolean" ? data.aktif : true],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (kodeError(error) === "23503") {
      return NextResponse.json({ error: "Rumah tidak ditemukan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal menambah warga" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
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

  const id = typeof data.id === "string" ? data.id.trim() : "";
  const houseId = typeof data.house_id === "string" ? data.house_id.trim() : "";
  const nama = typeof data.nama === "string" ? data.nama.trim() : "";
  const status = typeof data.status_keluarga === "string" ? data.status_keluarga.trim() : "";
  const noHp = typeof data.no_hp === "string" ? data.no_hp.trim() : "";

  if (!POLA_UUID.test(id)) {
    return NextResponse.json({ error: "ID warga tidak valid" }, { status: 400 });
  }
  if (!POLA_UUID.test(houseId)) {
    return NextResponse.json({ error: "Pilih rumah yang terdaftar" }, { status: 400 });
  }
  if (!nama) {
    return NextResponse.json({ error: "Nama warga wajib diisi" }, { status: 400 });
  }
  if (!STATUS_KELUARGA.includes(status as StatusKeluarga)) {
    return NextResponse.json({ error: "Status keluarga tidak dikenal" }, { status: 400 });
  }

  try {
    const rows = await queryAs<Warga>(
      { role: sesi.role, userId: sesi.profileId },
      "update residents set house_id=$1, nama=$2, status_keluarga=$3, no_hp=$4, aktif=$5 where id=$6 returning id, house_id, nama, status_keluarga, no_hp, aktif",
      [houseId, nama, status, noHp || null, typeof data.aktif === "boolean" ? data.aktif : true, id],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    if (kodeError(error) === "23503") {
      return NextResponse.json({ error: "Rumah tidak ditemukan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal mengubah warga" }, { status: 500 });
  }
}
