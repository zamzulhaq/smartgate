"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Warga = { id: string; nama: string };
type Kartu = {
  id: string;
  resident_id: string;
  label: string | null;
  status: string;
  created_at: string;
  nama: string;
};

export default function KartuClient() {
  const router = useRouter();
  const [warga, setWarga] = useState<Warga[]>([]);
  const [kartu, setKartu] = useState<Kartu[]>([]);
  const [pesan, setPesan] = useState("");

  async function muat() {
    const [rw, rk] = await Promise.all([
      fetch("/api/residents/aktif").then((r) => r.json()),
      fetch("/api/cards").then((r) => r.json()),
    ]);
    setWarga(Array.isArray(rw) ? rw : []);
    setKartu(Array.isArray(rk) ? rk : []);
  }

  useEffect(() => {
    muat();
  }, []);

  async function daftar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const isi = new FormData(form);
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resident_id: isi.get("resident_id"),
        uid: isi.get("uid"),
        label: isi.get("label"),
        status: isi.get("status"),
      }),
    });
    const data = await res.json();
    setPesan(res.ok ? "Kartu berhasil didaftarkan." : data.error ?? "Gagal mendaftarkan kartu.");
    if (res.ok) {
      form.reset();
      muat();
      router.refresh();
    }
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
          <Link href="/kartu" className="rounded px-2 py-1 text-zinc-900 hover:bg-zinc-100">
            Kartu Akses
          </Link>
        </nav>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
          <div>
            <p className="text-sm font-medium text-zinc-900">Kartu Akses</p>
            <p className="text-xs text-zinc-500">Daftarkan kartu dummy ke warga (hanya admin)</p>
          </div>
          <div className="md:hidden">
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/" className="text-zinc-700">
                Dashboard
              </Link>
              <Link href="/rumah-warga" className="text-zinc-700">
                Rumah &amp; Warga
              </Link>
              <Link href="/kartu" className="text-zinc-900">
                Kartu Akses
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          <section className="flex flex-col gap-3 rounded border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-900">Daftarkan Kartu (Dummy)</h2>
            <p className="text-xs text-zinc-500">UID tidak disimpan mentah. Hanya HMAC-SHA256 yang disimpan.</p>
            <form onSubmit={daftar} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                Warga
                <select name="resident_id" required className="rounded border border-zinc-300 px-2 py-1">
                  <option value="">-- pilih warga --</option>
                  {warga.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nama}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                UID Dummy (heks)
                <input name="uid" required placeholder="04AABBCCDD" className="rounded border border-zinc-300 px-2 py-1" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Label
                <input name="label" placeholder="KTP lama" className="rounded border border-zinc-300 px-2 py-1" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Status
                <select name="status" className="rounded border border-zinc-300 px-2 py-1">
                  <option value="aktif">aktif</option>
                  <option value="dicabut">dicabut</option>
                  <option value="hilang">hilang</option>
                </select>
              </label>
              <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
                Daftarkan
              </button>
            </form>
            {pesan && <p className="text-sm text-zinc-700">{pesan}</p>}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-zinc-900">Daftar Kartu</h2>
            <div className="overflow-x-auto rounded border border-zinc-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-3 py-2">Warga</th>
                    <th className="px-3 py-2">Label</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Terdaftar</th>
                  </tr>
                </thead>
                <tbody>
                  {kartu.map((k) => (
                    <tr key={k.id} className="border-b border-zinc-100">
                      <td className="px-3 py-2">{k.nama}</td>
                      <td className="px-3 py-2">{k.label ?? "-"}</td>
                      <td className="px-3 py-2">{k.status}</td>
                      <td className="px-3 py-2">{k.created_at}</td>
                    </tr>
                  ))}
                  {kartu.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-2 text-zinc-500">
                        Belum ada kartu terdaftar.
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
