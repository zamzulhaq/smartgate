import { Suspense } from "react";
import DbStatus from "./db-status";
import WargaRumah from "./warga-rumah";
import LoginBox from "./login-box";
import { queryAs } from "@/lib/db";
import type { Rumah, Warga } from "@/lib/types";
import { dapatkanSesi } from "@/lib/require-admin";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header>
        <p className="text-sm font-medium text-zinc-500">Portal Pengelola</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
          {"Smart Gate & Manajemen Perumahan"}
        </h1>
        <p className="mt-2 text-zinc-600">Data rumah dan warga (khusus admin).</p>
      </header>

      <section aria-label="Status database">
        <Suspense
          fallback={<p className="text-sm text-zinc-500">Memeriksa koneksi database...</p>}
        >
          <DbStatus />
        </Suspense>
      </section>

      <LoginBox />

      <Suspense fallback={<p className="text-sm text-zinc-500">Memuat data rumah dan warga...</p>}>
        <DataWargaRumah />
      </Suspense>
    </main>
  );
}

async function DataWargaRumah() {
  const sesi = await dapatkanSesi();
  if (!sesi || sesi.role !== "admin") {
    return <p className="text-sm text-zinc-600">Login sebagai admin untuk melihat dan mengelola rumah/warga.</p>;
  }

  let rumah: Rumah[] = [];
  let warga: Warga[] = [];
  try {
    [rumah, warga] = await Promise.all([
      queryAs<Rumah>(
        { role: sesi.role, userId: sesi.profileId },
        "select id, blok, nomor, status_hunian, catatan from houses order by blok, nomor",
      ),
      queryAs<Warga>(
        { role: sesi.role, userId: sesi.profileId },
        "select id, house_id, nama, status_keluarga, no_hp, aktif from residents order by nama",
      ),
    ]);
  } catch {
    return <p className="text-sm text-zinc-600">Akses ditolak atau gagal memuat data.</p>;
  }

  return <WargaRumah rumah={rumah} warga={warga} />;
}
