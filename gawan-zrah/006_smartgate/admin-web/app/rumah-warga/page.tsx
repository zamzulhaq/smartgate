import Link from "next/link";
import { Suspense } from "react";
import DbStatus from "../db-status";
import WargaRumah from "../warga-rumah";
import LoginBox from "../login-box";
import { queryAs } from "@/lib/db";
import type { Rumah, Warga } from "@/lib/types";
import { dapatkanSesi } from "@/lib/require-admin";

export default function RumahWargaPage() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="hidden w-64 border-r border-zinc-200 bg-white md:flex md:flex-col">
        <div className="border-b border-zinc-200 px-4 py-4">
          <p className="text-sm font-semibold text-zinc-900">Smart Gate</p>
          <p className="text-xs text-zinc-500">Manajemen Perumahan</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3 text-sm">
          <Link href="/" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">
            Dashboard
          </Link>
          <Link href="/rumah-warga" className="rounded px-2 py-1 text-zinc-900 hover:bg-zinc-100">
            Rumah &amp; Warga
          </Link>
          <Link href="/kartu" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">
            Kartu Akses
          </Link>
          <Link href="/log-akses" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">
            Log Akses
          </Link>
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-900">Manajemen Rumah &amp; Warga</p>
            <p className="text-xs text-zinc-500">Tambah, lihat, dan edit data</p>
          </div>
          <div className="md:hidden">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-zinc-700">
                Dashboard
              </Link>
            <Link href="/rumah-warga" className="text-zinc-900">
              Rumah &amp; Warga
            </Link>
            <Link href="/kartu" className="text-zinc-700">
              Kartu Akses
            </Link>
            <Link href="/log-akses" className="text-zinc-700">
              Log Akses
            </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">
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
      </div>
    </div>
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
