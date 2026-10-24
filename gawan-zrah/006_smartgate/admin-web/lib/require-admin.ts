import { cookies } from "next/headers";
import { query } from "@/lib/db";

const NAMA_KUE = "sg_session";

export type SesiAdmin = { profileId: string; role: string; email: string; nama: string };

export async function dapatkanSesi(): Promise<SesiAdmin | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NAMA_KUE)?.value;
  if (!token) return null;

  try {
    const rows = await query<SesiAdmin>(
      "select profile_id as \"profileId\", role, email, nama from app_get_session($1)",
      [token],
    );
    if (rows.length === 0) return null;
    return rows[0];
  } catch {
    return null;
  }
}
