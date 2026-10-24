import Link from "next/link";
import { Suspense } from "react";
import DbStatus from "./db-status";
import LoginBox from "./login-box";
import { queryAs } from "@/lib/db";
import { dapatkanSesi } from "@/lib/require-admin";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="hidden w-64 border-r border-zinc-200 bg-white md:flex md:flex-col">
        <div className="border-b border-zinc-200 px-4 py-4">
          <p className="text-sm font-semibold text-zinc-900">Smart Gate</p>
          <p className="text-xs text-zinc-500">Manajemen Perumahan</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3 text-sm">
          <Link href="/" className="rounded px-2 py-1 text-zinc-900 hover:bg-zinc-100">
            Dashboard
          </Link>
          <Link href="/rumah-warga" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">
            Rumah &amp; Warga
          </Link>
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-900">Dashboard Admin</p>
            <p className="text-xs text-zinc-500">Pengelolaan rumah dan warga</p>
          </div>
          <div className="md:hidden">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-zinc-900">
                Dashboard
              </Link>
              <Link href="/rumah-warga" className="text-zinc-700">
                Rumah &amp; Warga
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          <section aria-label="Status database">
            <Suspense
              fallback={<p className="text-sm text-zinc-500">Memeriksa koneksi database...</p>}
            >
              <DbStatus />
            </Suspense>
          </section>

          <LoginBox />

          <Suspense fallback={<p className="text-sm text-zinc-500">Memuat ringkasan...</p>}>
            <Ringkasan />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

async function Ringkasan() {
  const sesi = await dapatkanSesi();
  if (!sesi || sesi.role !== "admin") {
    return (
      <p className="text-sm text-zinc-600">
        Login sebagai admin untuk melihat dashboard.
      </p>
    );
  }

  try {
    const [rumah, warga] = await Promise.all([
      queryAs<{ total: string }>(
        { role: sesi.role, userId: sesi.profileId },
        "select count(*)::text as total from houses",
      ),
      queryAs<{ total: string }>(
        { role: sesi.role, userId: sesi.profileId },
        "select count(*)::text as total from residents",
      ),
    ]);

    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-900">Ringkasan</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Total Rumah</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{rumah[0]?.total ?? "0"}</p>
          </div>
          <div className="rounded border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">Total Warga</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900">{warga[0]?.total ?? "0"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/rumah-warga"
            className="rounded bg-zinc-900 px-3 py-1 text-white"
          >
            Kelola Rumah &amp; Warga
          </Link>
        </div>
      </section>
    );
  } catch {
    return <p className="text-sm text-zinc-600">Akses ditolak atau gagal memuat ringkasan.</p>;
  }
}
