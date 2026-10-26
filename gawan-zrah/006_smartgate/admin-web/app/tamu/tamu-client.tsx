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
  const [tamu, setTamu] = useState<Tamu[]>([]);
  const [rumah, setRumah] = useState<Rumah[]>([]);
  const [kunjungan, setKunjungan] = useState<Kunjungan[]>([]);
  const [pesan, setPesan] = useState("");
  const [cari, setCari] = useState("");
  const [pilih, setPilih] = useState<Tamu | null>(null);

  async function muatTamu(q: string) {
    const url = q ? `/api/guests?q=${encodeURIComponent(q)}` : "/api/guests";
    const rt = await fetch(url).then((r) => r.json());
    setTamu(Array.isArray(rt) ? rt : []);
  }

  async function muatKunjungan(guestId: string) {
    const url = guestId ? `/api/guest-visits?guest_id=${guestId}` : "/api/guest-visits";
    const rk = await fetch(url).then((r) => r.json());
    setKunjungan(Array.isArray(rk) ? rk : []);
  }

  async function muat() {
    const rr = await fetch("/api/houses/ringkas").then((r) => r.json());
    setRumah(Array.isArray(rr) ? rr : []);
    await Promise.all([muatTamu(cari), muatKunjungan(pilih?.id ?? "")]);
  }

  useEffect(() => {
    muat();
  }, []);

  async function daftarTamu(e: React.FormEvent<HTMLFormElement>) {
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
    setPesan(
      data.duplikat
        ? `NIK sudah terdaftar sebagai ${data.nama}. Gunakan data lama untuk mencatat kunjungan.`
        : "Tamu baru berhasil didaftarkan.",
    );
    form.reset();
    muat();
  }

  async function catatKunjungan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const isi = new FormData(form);
    const res = await fetch("/api/guest-visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_id: isi.get("guest_id"),
        house_id: isi.get("house_id"),
        keperluan: isi.get("keperluan"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPesan(data.error ?? "Gagal mencatat kunjungan.");
      return;
    }
    setPesan("Kunjungan tamu berhasil dicatat.");
    form.reset();
    muat();
  }

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
          <Link href="/log-akses" className="rounded px-2 py-1 text-zinc-700 hover:bg-zinc-100">
            Log Akses
          </Link>
          <Link href="/tamu" className="rounded px-2 py-1 text-zinc-900 hover:bg-zinc-100">
            Tamu
          </Link>
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-900">Tamu</p>
            <p className="text-xs text-zinc-500">Registrasi profil tamu dan pencatatan kunjungan</p>
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
              <Link href="/log-akses" className="text-zinc-700">
                Log Akses
              </Link>
              <Link href="/tamu" className="text-zinc-900">
                Tamu
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-900">Registrasi Profil Tamu</h2>
            <p className="text-xs text-zinc-500">
              Verifikasi e-KTP secara manual. NIK hanya dipakai untuk mengenali tamu lama dan tidak
              ditampilkan lagi.
            </p>
            <form onSubmit={daftarTamu} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Nama Tamu
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
                Simpan Tamu
              </button>
            </form>
          </section>

          <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-900">Catat Kunjungan</h2>
            <form onSubmit={catatKunjungan} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Tamu
                <select name="guest_id" required className="rounded border border-zinc-300 px-2 py-1">
                  <option value="">-- pilih tamu --</option>
                  {tamu.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Rumah Tujuan
                <select name="house_id" required className="rounded border border-zinc-300 px-2 py-1">
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
                <input name="keperluan" placeholder="mis. kirim paket" className="rounded border border-zinc-300 px-2 py-1" />
              </label>
              <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
                Catat
              </button>
            </form>
            {pesan && <p className="text-sm text-zinc-700">{pesan}</p>}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-zinc-900">Profil Tamu</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                muatTamu(cari);
              }}
              className="flex flex-wrap items-end gap-2"
            >
              <label className="flex flex-col gap-1 text-sm">
                Cari Nama Tamu
                <input
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder="mis. Budi"
                  className="rounded border border-zinc-300 px-2 py-1"
                />
              </label>
              <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
                Cari
              </button>
              <button
                type="button"
                onClick={() => {
                  setCari("");
                  muatTamu("");
                }}
                className="rounded border border-zinc-300 px-3 py-1 text-sm text-zinc-700"
              >
                Tampilkan Semua
              </button>
            </form>
            <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-3 py-2">Nama</th>
                    <th className="px-3 py-2">Jumlah Kunjungan</th>
                    <th className="px-3 py-2">Kunjungan Terakhir</th>
                    <th className="px-3 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tamu.map((t) => (
                    <tr key={t.id} className="border-b border-zinc-100">
                      <td className="px-3 py-2">{t.nama}</td>
                      <td className="px-3 py-2">{t.jumlah_kunjungan}</td>
                      <td className="px-3 py-2">{t.terakhir_datang ? waktu(t.terakhir_datang) : "-"}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPilih(t);
                            muatKunjungan(t.id);
                          }}
                          className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                        >
                          Lihat Riwayat
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tamu.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-zinc-500">
                        Tidak ada tamu yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-zinc-900">
                Riwayat Kunjungan{pilih ? `: ${pilih.nama}` : " (semua tamu)"}
              </h2>
              {pilih && (
                <button
                  type="button"
                  onClick={() => {
                    setPilih(null);
                    muatKunjungan("");
                  }}
                  className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
                >
                  Tampilkan Semua
                </button>
              )}
            </div>
            <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-3 py-2">Waktu</th>
                    <th className="px-3 py-2">Tamu</th>
                    <th className="px-3 py-2">Rumah Tujuan</th>
                    <th className="px-3 py-2">Keperluan</th>
                    <th className="px-3 py-2">Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {kunjungan.map((k) => (
                    <tr key={k.id} className="border-b border-zinc-100">
                      <td className="px-3 py-2">{waktu(k.waktu_datang)}</td>
                      <td className="px-3 py-2">{k.nama_tamu}</td>
                      <td className="px-3 py-2">
                        {k.blok} {k.nomor}
                      </td>
                      <td className="px-3 py-2">{k.keperluan ?? "-"}</td>
                      <td className="px-3 py-2">{k.petugas}</td>
                    </tr>
                  ))}
                  {kunjungan.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-zinc-500">
                        Belum ada kunjungan tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
