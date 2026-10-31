"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

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

  function hasilBadge(hasil: string) {
    if (hasil === "berhasil" || hasil === "sukses") {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Berhasil</Badge>;
    }
    return <Badge className="bg-red-50 text-red-700 border-red-200">Ditolak</Badge>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text md:text-2xl">Log Akses</h1>
        <p className="text-sm text-muted">Riwayat akses gerbang (hanya baca)</p>
      </div>

      {pesan ? <p className="text-sm text-text">{pesan}</p> : null}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <FileText className="h-5 w-5 text-muted" />
          <h2 className="text-base font-semibold text-text">Riwayat Akses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Gerbang</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Arah</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Metode</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Hasil</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Alasan Penolakan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Warga/Tamu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {log.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4 text-text">{waktu(l.server_time)}</td>
                  <td className="px-6 py-4 text-text">{l.gerbang ?? "-"}</td>
                  <td className="px-6 py-4 text-text">{l.arah}</td>
                  <td className="px-6 py-4 text-text">{l.metode}</td>
                  <td className="px-6 py-4">{hasilBadge(l.hasil)}</td>
                  <td className="px-6 py-4 text-muted">{l.alasan_tolak ?? "-"}</td>
                  <td className="px-6 py-4 text-text">{l.nama_warga ?? "-"}</td>
                </tr>
              ))}
              {log.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-muted">Belum ada log akses.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-xs text-muted">Log bersifat insert-only; tidak bisa diubah atau dihapus.</p>
    </div>
  );
}
