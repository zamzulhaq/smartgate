import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { kodeError, queryAs } from "@/lib/db";
import { STATUS_HUNIAN, type Rumah, type StatusHunian } from "@/lib/types";

export async function GET() {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }

  try {
    const rows = await queryAs<Rumah>(
      { role: sesi.role, userId: sesi.profileId },
      "select id, blok, nomor, status_hunian, catatan from houses order by blok, nomor",
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar rumah" }, { status: 500 });
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

  const blok = typeof data.blok === "string" ? data.blok.trim() : "";
  const nomor = typeof data.nomor === "string" ? data.nomor.trim() : "";
  const status = data.status_hunian;
  const catatan = typeof data.catatan === "string" ? data.catatan.trim() : "";

  if (!blok || !nomor) {
    return NextResponse.json({ error: "Blok dan nomor rumah wajib diisi" }, { status: 400 });
  }
  if (!STATUS_HUNIAN.includes(status as StatusHunian)) {
    return NextResponse.json({ error: "Status hunian tidak dikenal" }, { status: 400 });
  }

  try {
    const rows = await queryAs<Rumah>(
      { role: sesi.role, userId: sesi.profileId },
      "insert into houses (blok, nomor, status_hunian, catatan) values ($1, $2, $3, $4) returning id, blok, nomor, status_hunian, catatan",
      [blok, nomor, status, catatan || null],
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    if (kodeError(error) === "23505") {
      return NextResponse.json(
        { error: "Rumah dengan blok dan nomor yang sama sudah ada" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Gagal menambah rumah" }, { status: 500 });
  }
}
