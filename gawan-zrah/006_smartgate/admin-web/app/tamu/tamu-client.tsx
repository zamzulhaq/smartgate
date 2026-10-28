"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  }, []);

  async function buatTamu(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
    // ambil total terbaru
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
    setKunjungan([]);
    setTampilBuat(false);
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="hidden w-64 border-r border-zinc-200 bg-white md:flex md:flex-col">
        <div className="border-b border-zinc-200 px-4 py-4">
          <p className="text-sm font-semibold text-zinc-900">Smart Gate</p>
          <p className="text-xs text-zinc-500">Manajemen Perumahan</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-3 text-sm">
          <Link href="/" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">Dashboard</Link>
          <Link href="/rumah-warga" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">Rumah &amp; Warga</Link>
          <Link href="/kartu" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">Kartu Akses</Link>
          <Link href="/log-akses" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">Log Akses</Link>
          <Link href="/tamu" className="rounded px-2 py-1 text-zinc-900 hover:bg-zinc-100">Tamu</Link>
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-900">Tamu</p>
            <p className="text-xs text-zinc-500">Check-in tamu</p>
          </div>
          <div className="md:hidden">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-zinc-700">Dashboard</Link>
              <Link href="/rumah-warga" className="text-zinc-700">Rumah &amp; Warga</Link>
              <Link href="/kartu" className="text-zinc-700">Kartu Akses</Link>
              <Link href="/log-akses" className="text-zinc-700">Log Akses</Link>
              <Link href="/tamu" className="text-zinc-900">Tamu</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6 md:px-6">
          {konfirmasi && (
            <section className="flex flex-col gap-2 rounded border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-900">Kunjungan berhasil dicatat</p>
              <p className="text-sm text-emerald-800">
                Tamu: <span className="font-medium">{konfirmasi.nama}</span> · Total kunjungan:{" "}
                <span className="font-medium">{konfirmasi.total}</span>
              </p>
              <div>
                <button
                  type="button"
                  onClick={mulaiBaru}
                  className="rounded bg-emerald-900 px-3 py-1 text-sm text-white"
                >
                  Check-in tamu lain
                </button>
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-900">1) Cari atau daftarkan tamu</h2>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-1 flex-col gap-1 text-sm">
                Nama tamu
                <input
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      cariTamu();
                    }
                  }}
                  placeholder="Ketik nama untuk mencari"
                  className="rounded border border-zinc-300 px-2 py-1"
                />
              </label>
              <button type="button" onClick={cariTamu} className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
                Cari
              </button>
              <button
                type="button"
                onClick={() => {
                  setTampilBuat((v) => !v);
                  setPesan("");
                }}
                className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700"
              >
                {tampilBuat ? "Batal daftar baru" : "Daftar tamu baru"}
              </button>
            </div>

            {hasilCari.length > 0 && !tamuDipilih && (
              <div className="overflow-x-auto rounded border border-zinc-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">Jumlah Kunjungan</th>
                      <th className="px-3 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hasilCari.map((t) => (
                      <tr key={t.id} className="border-b border-zinc-100">
                        <td className="px-3 py-2">{t.nama}</td>
                        <td className="px-3 py-2">{t.jumlah_kunjungan}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => pilihTamu(t)}
                            className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                          >
                            Pilih
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tampilBuat && !tamuDipilih && (
              <form onSubmit={buatTamu} className="flex flex-wrap items-end gap-2 rounded border border-zinc-200 p-3">
                <label className="flex flex-col gap-1 text-sm">
                  Nama
                  <input name="nama" required className="rounded border border-zinc-300 px-2 py-1" />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  NIK (16 digit)
                  <input
                    name="nik"
                    required
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={16}
                    className="rounded border border-zinc-300 px-2 py-1"
                  />
                </label>
                <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
                  Simpan dan pilih
                </button>
              </form>
            )}

            {tamuDipilih && (
              <div className="flex items-center justify-between rounded border border-zinc-200 p-3">
                <p className="text-sm text-zinc-700">
                  Tamu terpilih: <span className="font-medium text-zinc-900">{tamuDipilih.nama}</span> ·
                  Jumlah kunjungan: <span className="font-medium">{tamuDipilih.jumlah_kunjungan}</span>
                </p>
                <button type="button" onClick={mulaiBaru} className="text-xs text-zinc-600 underline">
                  Ganti tamu
                </button>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-900">2) Catat kunjungan</h2>
            <form onSubmit={catatKunjungan} className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-sm">
                Rumah tujuan
                <select
                  value={ruang}
                  onChange={(e) => setRuang(e.target.value)}
                  required
                  disabled={!tamuDipilih}
                  className="rounded border border-zinc-300 px-2 py-1"
                >
                  <option value="">-- pilih rumah --</option>
                  {rumah.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.blok} {r.nomor}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Keperluan
                <input
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  disabled={!tamuDipilih}
                  placeholder="mis. bertamu"
                  className="rounded border border-zinc-300 px-2 py-1"
                />
              </label>
              <button
                type="submit"
                disabled={!tamuDipilih || !ruang || menyimpan}
                className="rounded bg-zinc-900 px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                {menyimpan ? "Menyimpan..." : "Simpan kunjungan"}
              </button>
            </form>
            <p className="text-xs text-zinc-500">Satu klik per kunjungan. Tombol nonaktif saat menyimpan.</p>
          </section>

          {tamuDipilih && (
            <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4">
              <h2 className="text-base font-semibold text-zinc-900">Riwayat kunjungan ({tamuDipilih.nama})</h2>
              <div className="overflow-x-auto rounded border border-zinc-200">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50">
                      <th className="px-3 py-2">Waktu</th>
                      <th className="px-3 py-2">Rumah Tujuan</th>
                      <th className="px-3 py-2">Keperluan</th>
                      <th className="px-3 py-2">Petugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kunjungan
                      .filter((k) => k.guest_id === tamuDipilih.id)
                      .map((k) => (
                        <tr key={k.id} className="border-b border-zinc-100">
                          <td className="px-3 py-2">{waktu(k.waktu_datang)}</td>
                          <td className="px-3 py-2">{k.blok} {k.nomor}</td>
                          <td className="px-3 py-2">{k.keperluan ?? "-"}</td>
                          <td className="px-3 py-2">{k.petugas}</td>
                        </tr>
                      ))}
                    {kunjungan.filter((k) => k.guest_id === tamuDipilih.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-3 py-2 text-zinc-500">Belum ada kunjungan.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {pesan && !konfirmasi && <p className="text-sm text-zinc-700">{pesan}</p>}
        </main>
      </div>
    </div>
  );
}
