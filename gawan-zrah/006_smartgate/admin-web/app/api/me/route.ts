import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";

export async function GET() {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (sesi.role !== "admin") {
    return NextResponse.json({ error: "Tidak berhak" }, { status: 403 });
  }
  return NextResponse.json({ user: { email: sesi.email, nama: sesi.nama, role: sesi.role } });
}
