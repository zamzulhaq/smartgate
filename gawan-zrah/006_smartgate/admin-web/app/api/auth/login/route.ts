import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { cekPassword } from "@/lib/password.mjs";

const NAMA_KUE = "sg_session";

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body harus berupa JSON" }, { status: 400 });
  }

  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email dan kata sandi wajib diisi" }, { status: 400 });
  }

  try {
    const akun = await query<{
      id: string;
      password_hash: string;
      role: string;
      nama: string;
    }>("select * from app_login($1)", [email]);

    if (akun.length === 0 || !cekPassword(password, akun[0].password_hash)) {
      return NextResponse.json({ error: "Email atau kata sandi salah" }, { status: 401 });
    }

    const a = akun[0];
    const sesi = await query<{ token: string }>(
      "select token from app_create_session($1, 24)",
      [a.id],
    );

    if (sesi.length === 0) {
      return NextResponse.json({ error: "Gagal membuat sesi" }, { status: 500 });
    }

    const res = NextResponse.json({ ok: true, nama: a.nama, role: a.role });
    res.cookies.set(NAMA_KUE, sesi[0].token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Gagal login" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NAMA_KUE)?.value;
  if (token) {
    try {
      await query("select app_delete_session($1)", [token]);
    } catch {
      // Cookie tetap dihapus walau penghapusan sesi di server gagal.
    }
  }
  cookieStore.delete(NAMA_KUE);
  return NextResponse.json({ ok: true });
}
