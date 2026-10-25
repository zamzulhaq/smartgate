import { NextResponse } from "next/server";
import { dapatkanSesi } from "@/lib/require-admin";
import { kodeError, queryAs } from "@/lib/db";

const POLA_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const aksi = typeof data.aksi === "string" ? data.aksi.trim() : "";

  if (!POLA_UUID.test(id)) {
    return NextResponse.json({ error: "ID kartu tidak valid" }, { status: 400 });
  }
  if (aksi !== "cabut" && aksi !== "aktifkan") {
    return NextResponse.json({ error: "Aksi tidak diizinkan" }, { status: 400 });
  }

  try {
    const rows =
      aksi === "cabut"
        ? await queryAs<{
            id: string;
            resident_id: string;
            label: string | null;
            status: string;
            revoked_at: string | null;
            created_at: string;
          }>(
            { role: sesi.role, userId: sesi.profileId },
            `update cards set status = 'dicabut', revoked_at = now()
             where id = $1 and status = 'aktif'
             returning id, resident_id, label, status, revoked_at, created_at`,
            [id],
          )
        : await queryAs<{
            id: string;
            resident_id: string;
            label: string | null;
            status: string;
            revoked_at: string | null;
            created_at: string;
          }>(
            { role: sesi.role, userId: sesi.profileId },
            `update cards set status = 'aktif', revoked_at = null
             where id = $1 and status = 'dicabut'
             returning id, resident_id, label, status, revoked_at, created_at`,
            [id],
          );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Kartu tidak ditemukan atau status tidak sesuai" }, { status: 400 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    const msg = kodeError(error);
    void msg;
    return NextResponse.json({ error: "Gagal mengubah status kartu" }, { status: 500 });
  }
}
