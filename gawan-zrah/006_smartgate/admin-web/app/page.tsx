import { Suspense } from "react";
import DbStatus from "./db-status";
import WargaRumah from "./warga-rumah";
import { query } from "@/lib/db";
import type { Rumah, Warga } from "@/lib/types";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <header>
        <p className="text-sm font-medium text-zinc-500">Portal Pengelola</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-900">
          {"Smart Gate & Manajemen Perumahan"}
        </h1>
        <p className="mt-2 text-zinc-600">
          Fondasi web admin: koneksi database lokal siap. Data warga, rumah, dan log
          akses gerbang menyusul.
        </p>
      </header>

      <section aria-label="Status database">
        <Suspense
          fallback={<p className="text-sm text-zinc-500">Memeriksa koneksi database...</p>}
        >
          <DbStatus />
        </Suspense>
      </section>

      <Suspense fallback={<p className="text-sm text-zinc-500">Memuat data rumah dan warga...</p>}>
        <DataWargaRumah />
      </Suspense>
    </main>
  );
}

// Data rumah dan warga diambil di server (bukan lewat API) supaya halaman
// pertama sudah berisi data. Penambahan data tetap lewat API lokal.
async function DataWargaRumah() {
  const [rumah, warga] = await Promise.all([
    query<Rumah>(
      "select id, blok, nomor, status_hunian, catatan from houses order by blok, nomor",
    ),
    query<Warga>(
      "select id, house_id, nama, status_keluarga, no_hp, aktif from residents order by nama",
    ),
  ]);

  return <WargaRumah rumah={rumah} warga={warga} />;
}
