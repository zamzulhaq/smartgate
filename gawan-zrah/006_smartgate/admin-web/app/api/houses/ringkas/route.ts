import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { queryAs } from "@/lib/db";

export async function GET() {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin" && sesi.role !== "satpam") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }

  try {
    const rows = await queryAs<{ id: string; blok: string; nomor: string }>(
      { role: sesi.role, userId: sesi.profileId },
      "select id, blok, nomor from houses order by blok, nomor",
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar rumah" }, { status: 500 });
  }
}
