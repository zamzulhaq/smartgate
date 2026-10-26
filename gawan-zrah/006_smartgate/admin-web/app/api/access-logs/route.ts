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
    const rows = await queryAs<{
      id: string;
      gerbang: string | null;
      device_arah: string | null;
      arah: string;
      metode: string;
      hasil: string;
      alasan_tolak: string | null;
      nama_warga: string | null;
      device_time: string;
      server_time: string;
    }>(
      { role: sesi.role, userId: sesi.profileId },
      `select l.id, ap.nama as gerbang, d.arah as device_arah, l.arah, l.metode,
              l.hasil, l.alasan_tolak, r.nama as nama_warga,
              l.device_time, l.server_time
       from access_logs l
       left join access_points ap on ap.id = l.access_point_id
       left join devices d on d.id = l.device_id
       left join residents r on r.id = l.resident_id
       order by l.server_time desc
       limit 100`,
    );
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Gagal membaca log akses" }, { status: 500 });
  }
}
