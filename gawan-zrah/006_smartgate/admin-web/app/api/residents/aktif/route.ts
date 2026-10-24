import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { queryAs } from "@/lib/db";

export async function GET() {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }

  try {
    const rows = await queryAs<{ id: string; nama: string }>(
      { role: sesi.role, userId: sesi.profileId },
      "select id, nama from residents where aktif = true order by nama",
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca daftar warga" }, { status: 500 });
  }
}

