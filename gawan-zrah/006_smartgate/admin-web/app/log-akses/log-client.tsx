"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Log = {
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
};

function waktu(nilai: string) {
  return new Date(nilai).toLocaleString("id-ID");
}

export default function LogClient() {
  const [log, setLog] = useState<Log[]>([]);
  const [pesan, setPesan] = useState("");

  useEffect(() => {
    fetch("/api/access-logs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLog(data);
        else setPesan(data.error ?? "Gagal memuat log akses.");
      })
      .catch(() => setPesan("Gagal memuat log akses."));
  }, []);

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
          <Link href="/rumah-warga" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">
            Rumah &amp; Warga
          </Link>
          <Link href="/kartu" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">
            Kartu Akses
          </Link>
          <Link href="/log-akses" className="rounded px-2 py-1 text-zinc-900 hover:bg-zinc-100">
            Log Akses
          </Link>
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-900">Log Akses</p>
            <p className="text-xs text-zinc-500">Riwayat tap kartu/QR di gerbang (hanya baca)</p>
          </div>
          <div className="md:hidden">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-zinc-700">
                Dashboard
              </Link>
              <Link href="/rumah-warga" className="text-zinc-700">
                Rumah &amp; Warga
              </Link>
              <Link href="/kartu" className="text-zinc-700">
                Kartu Akses
              </Link>
              <Link href="/log-akses" className="text-zinc-900">
                Log Akses
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6 md:px-6">
          <p className="text-xs text-zinc-500">Log bersifat insert-only; tidak bisa diubah atau dihapus.</p>
          {pesan && <p className="text-sm text-zinc-700">{pesan}</p>}
          <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-3 py-2">Waktu</th>
                  <th className="px-3 py-2">Gerbang</th>
                  <th className="px-3 py-2">Arah</th>
                  <th className="px-3 py-2">Metode</th>
                  <th className="px-3 py-2">Hasil</th>
                  <th className="px-3 py-2">Alasan</th>
                  <th className="px-3 py-2">Warga</th>
                </tr>
              </thead>
              <tbody>
                {log.map((l) => (
                  <tr key={l.id} className="border-b border-zinc-100">
                    <td className="px-3 py-2">{waktu(l.server_time)}</td>
                    <td className="px-3 py-2">{l.gerbang ?? "-"}</td>
                    <td className="px-3 py-2">{l.arah}</td>
                    <td className="px-3 py-2">{l.metode}</td>
                    <td className="px-3 py-2">{l.hasil}</td>
                    <td className="px-3 py-2">{l.alasan_tolak ?? "-"}</td>
                    <td className="px-3 py-2">{l.nama_warga ?? "-"}</td>
                  </tr>
                ))}
                {log.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-2 text-zinc-500">
                      Belum ada log akses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
