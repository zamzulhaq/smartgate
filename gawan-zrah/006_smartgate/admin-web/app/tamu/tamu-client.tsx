"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Users, Home, CheckCircle2 } from "lucide-react";

type Tamu = {
  id: string;
  nama: string;
  jumlah_kunjungan: number;
  terakhir_datang: string | null;
};
type Rumah = { id: string; blok: string; nomor: string };
type Kunjungan = {
  id: string;
  guest_id: string;
  nama_tamu: string;
  blok: string;
  nomor: string;
  keperluan: string | null;
  petugas: string;
  waktu_datang: string;
};

function waktu(nilai: string) {
  return new Date(nilai).toLocaleString("id-ID");
}

export default function TamuClient() {
  const [rumah, setRumah] = useState<Rumah[]>([]);
  const [cari, setCari] = useState("");
  const [hasilCari, setHasilCari] = useState<Tamu[]>([]);
  const [tamuDipilih, setTamuDipilih] = useState<Tamu | null>(null);
  const [keperluan, setKeperluan] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState("");
  const [konfirmasi, setKonfirmasi] = useState<{ nama: string; total: number } | null>(null);
  const [tampilBuat, setTampilBuat] = useState(false);
  const [kunjungan, setKunjungan] = useState<Kunjungan[]>([]);
  const [ruang, setRuang] = useState("");

  async function muatRumah() {
    const rr = await fetch("/api/houses/ringkas").then((r) => r.json());
    setRumah(Array.isArray(rr) ? rr : []);
  }

  async function cariTamu() {
    const q = cari.trim();
    if (!q) {
      setHasilCari([]);
      return;
    }
    const rt = await fetch(`/api/guests?q=${encodeURIComponent(q)}`).then((r) => r.json());
    setHasilCari(Array.isArray(rt) ? rt : []);
  }

  async function muatKunjungan(guestId: string) {
    const url = guestId ? `/api/guest-visits?guest_id=${guestId}` : "/api/guest-visits";
    const rk = await fetch(url).then((r) => r.json());
    setKunjungan(Array.isArray(rk) ? rk : []);
  }

  useEffect(() => {
    muatRumah();
    muatKunjungan("");
  }, []);

  async function buatTamu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (menyimpan) return;
    setMenyimpan(true);
    const form = e.currentTarget;
    const isi = new FormData(form);
    const res = await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: isi.get("nama"), nik: isi.get("nik") }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPesan(data.error ?? "Gagal menyimpan data tamu.");
      setMenyimpan(false);
      return;
    }
    const t: Tamu = { id: data.id, nama: data.nama, jumlah_kunjungan: 0, terakhir_datang: null };
    setPesan(data.duplikat ? `Tamu lama terdeteksi: ${data.nama}.` : "Tamu baru berhasil didaftarkan.");
    setTamuDipilih(t);
    setHasilCari([]);
    setCari(t.nama);
    setTampilBuat(false);
    form.reset();
    muatKunjungan(t.id);
    setKonfirmasi(null);
    setMenyimpan(false);
  }

  async function catatKunjungan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tamuDipilih || !ruang) return;
    if (menyimpan) return;
    setMenyimpan(true);
    setPesan("");
    const res = await fetch("/api/guest-visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_id: tamuDipilih.id,
        house_id: ruang,
        keperluan: keperluan.trim() || null,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPesan(data.error ?? "Gagal mencatat kunjungan.");
      setMenyimpan(false);
      return;
    }
    const q = tamuDipilih.nama.trim();
    const rt = await fetch(`/api/guests?q=${encodeURIComponent(q)}`).then((r) => r.json());
    let total = tamuDipilih.jumlah_kunjungan + 1;
    if (Array.isArray(rt)) {
      const found = rt.find((x: Tamu) => x.id === tamuDipilih.id);
      if (found) total = found.jumlah_kunjungan;
    }
    setKonfirmasi({ nama: tamuDipilih.nama, total });
    setKeperluan("");
    setRuang("");
    setPesan("");
    muatKunjungan(tamuDipilih.id);
    setMenyimpan(false);
  }

  function pilihTamu(t: Tamu) {
    setTamuDipilih(t);
    setHasilCari([]);
    setCari(t.nama);
    setPesan("");
    setKonfirmasi(null);
    muatKunjungan(t.id);
  }

  function mulaiBaru() {
    setTamuDipilih(null);
    setHasilCari([]);
    setCari("");
    setKeperluan("");
    setRuang("");
    setPesan("");
    setKonfirmasi(null);
    muatKunjungan("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text md:text-2xl">Manajemen Tamu</h1>
        <p className="text-sm text-muted">Check-in tamu baru atau tamu lama</p>
      </div>

      {konfirmasi ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <div className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-base font-semibold text-emerald-900">Kunjungan berhasil dicatat</p>
            </div>
            <p className="text-sm text-emerald-800">
              Tamu: <span className="font-medium">{konfirmasi.nama}</span> · Total kunjungan: <span className="font-medium">{konfirmasi.total}</span>
            </p>
            <div>
              <Button onClick={mulaiBaru} className="bg-emerald-900 hover:bg-emerald-900/90">Check-in tamu lain</Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted" />
                <h2 className="text-base font-semibold text-text">Cari Tamu</h2>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setTampilBuat(!tampilBuat)} className="gap-1">
                <UserPlus className="h-4 w-4" />
                Tamu Baru
              </Button>
            </div>
            <div className="flex gap-2">
              <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari nama tamu..." />
              <Button onClick={cariTamu}>Cari</Button>
            </div>
            {hasilCari.length > 0 ? (
              <div className="flex flex-col gap-2">
                {hasilCari.map((t) => (
                  <button key={t.id} onClick={() => pilihTamu(t)} className="flex items-center justify-between rounded-[12px] border border-border p-3 text-left hover:bg-zinc-50">
                    <div>
                      <p className="text-sm font-medium text-text">{t.nama}</p>
                      <p className="text-xs text-muted">Kunjungan: {t.jumlah_kunjungan}</p>
                    </div>
                    <Badge>Pilih</Badge>
                  </button>
                ))}
              </div>
            ) : null}
            {tampilBuat ? (
              <form onSubmit={buatTamu} className="flex flex-col gap-3 rounded-[12px] border border-border p-4">
                <p className="text-sm font-medium text-text">Daftarkan Tamu Baru</p>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-text">Nama Lengkap</label>
                  <Input name="nama" required />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-text">NIK (untuk deteksi duplikat)</label>
                  <Input name="nik" required placeholder="Masukkan NIK" />
                  <p className="text-xs text-muted">NIK tidak ditampilkan setelah disimpan (HMAC).</p>
                </div>
                <Button type="submit" disabled={menyimpan} className="w-full">{menyimpan ? "Menyimpan..." : "Daftarkan & Lanjut Check-in"}</Button>
              </form>
            ) : null}
            {pesan ? <p className="text-sm text-text">{pesan}</p> : null}
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-muted" />
              <h2 className="text-base font-semibold text-text">Form Check-in</h2>
            </div>
            {tamuDipilih ? (
              <form onSubmit={catatKunjungan} className="flex flex-col gap-4">
                <div className="rounded-[12px] bg-zinc-50 p-3">
                  <p className="text-sm font-medium text-text">{tamuDipilih.nama}</p>
                  <p className="text-xs text-muted">Total kunjungan: {tamuDipilih.jumlah_kunjungan}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-text">Tujuan Rumah</label>
                  <select value={ruang} onChange={(e) => setRuang(e.target.value)} required className="rounded-[12px] border border-border px-3 py-2 text-sm">
                    <option value="">-- Pilih rumah tujuan --</option>
                    {rumah.map((r) => (
                      <option key={r.id} value={r.id}>{r.blok} No. {r.nomor}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-text">Keperluan</label>
                  <Input value={keperluan} onChange={(e) => setKeperluan(e.target.value)} placeholder="Contoh: Mengantar paket" />
                </div>
                <Button type="submit" disabled={menyimpan || !ruang} className="w-full">{menyimpan ? "Menyimpan..." : "Catat Kunjungan"}</Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <Users className="h-8 w-8 text-muted" />
                <p className="text-sm text-muted">Pilih atau daftarkan tamu terlebih dahulu</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 p-6">
          <h2 className="text-base font-semibold text-text">Riwayat Kunjungan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">Tamu</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">Tujuan</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">Keperluan</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">Petugas</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted">Waktu Datang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {kunjungan.map((k) => (
                  <tr key={k.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-medium text-text">{k.nama_tamu}</td>
                    <td className="px-4 py-3 text-text">{k.blok} No. {k.nomor}</td>
                    <td className="px-4 py-3 text-muted">{k.keperluan || "-"}</td>
                    <td className="px-4 py-3 text-text">{k.petugas}</td>
                    <td className="px-4 py-3 text-muted">{waktu(k.waktu_datang)}</td>
                  </tr>
                ))}
                {kunjungan.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-muted">Belum ada riwayat kunjungan</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
