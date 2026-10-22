"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_HUNIAN, STATUS_KELUARGA, type Rumah, type Warga } from "@/lib/types";

// Data awal dikirim dari Server Component (app/page.tsx). Setelah tambah data,
// komponen ini memanggil router.refresh() supaya server mengirim data baru.
export default function WargaRumah({
  rumah,
  warga,
}: {
  rumah: Rumah[];
  warga: Warga[];
}) {
  const router = useRouter();
  const [pesan, setPesan] = useState("");

  async function tambahRumah(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const isi = new FormData(form);
    const hasil = await fetch("/api/houses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        blok: isi.get("blok"),
        nomor: isi.get("nomor"),
        status_hunian: isi.get("status_hunian"),
        catatan: isi.get("catatan"),
      }),
    });
    const data = await hasil.json();
    setPesan(hasil.ok ? "Rumah berhasil disimpan." : (data.error ?? "Gagal menambah rumah."));
    if (hasil.ok) {
      form.reset();
      router.refresh();
    }
  }

  async function tambahWarga(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const isi = new FormData(form);
    const hasil = await fetch("/api/residents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        house_id: isi.get("house_id"),
        nama: isi.get("nama"),
        status_keluarga: isi.get("status_keluarga"),
        no_hp: isi.get("no_hp"),
        aktif: isi.get("aktif") === "on",
      }),
    });
    const data = await hasil.json();
    setPesan(hasil.ok ? "Warga berhasil disimpan." : (data.error ?? "Gagal menambah warga."));
    if (hasil.ok) {
      form.reset();
      router.refresh();
    }
  }

  function labelRumah(houseId: string) {
    const item = rumah.find((rumahItem) => rumahItem.id === houseId);
    return item ? `${item.blok} ${item.nomor}` : "-";
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-900">Rumah</h2>

        <form onSubmit={tambahRumah} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Blok
            <input name="blok" required className="rounded border border-zinc-300 px-2 py-1" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Nomor
            <input name="nomor" required className="rounded border border-zinc-300 px-2 py-1" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Status Hunian
            <select name="status_hunian" className="rounded border border-zinc-300 px-2 py-1">
              {STATUS_HUNIAN.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Catatan
            <input name="catatan" className="rounded border border-zinc-300 px-2 py-1" />
          </label>
          <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
            Tambah Rumah
          </button>
        </form>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="py-2">Blok</th>
              <th className="py-2">Nomor</th>
              <th className="py-2">Status Hunian</th>
              <th className="py-2">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {rumah.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-2">{item.blok}</td>
                <td className="py-2">{item.nomor}</td>
                <td className="py-2">{item.status_hunian}</td>
                <td className="py-2">{item.catatan ?? "-"}</td>
              </tr>
            ))}
            {rumah.length === 0 && (
              <tr>
                <td colSpan={4} className="py-2 text-zinc-500">
                  Belum ada rumah.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-900">Warga</h2>

        <form onSubmit={tambahWarga} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Nama
            <input name="nama" required className="rounded border border-zinc-300 px-2 py-1" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Rumah
            <select name="house_id" required className="rounded border border-zinc-300 px-2 py-1">
              <option value="">-- pilih rumah --</option>
              {rumah.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.blok} {item.nomor}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Status Keluarga
            <select name="status_keluarga" className="rounded border border-zinc-300 px-2 py-1">
              {STATUS_KELUARGA.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            No HP
            <input name="no_hp" className="rounded border border-zinc-300 px-2 py-1" />
          </label>
          <label className="flex items-center gap-2 pb-1 text-sm">
            <input type="checkbox" name="aktif" defaultChecked />
            Aktif
          </label>
          <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
            Tambah Warga
          </button>
        </form>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="py-2">Nama</th>
              <th className="py-2">Rumah</th>
              <th className="py-2">Status Keluarga</th>
              <th className="py-2">No HP</th>
              <th className="py-2">Aktif</th>
            </tr>
          </thead>
          <tbody>
            {warga.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-2">{item.nama}</td>
                <td className="py-2">{labelRumah(item.house_id)}</td>
                <td className="py-2">{item.status_keluarga}</td>
                <td className="py-2">{item.no_hp ?? "-"}</td>
                <td className="py-2">{item.aktif ? "ya" : "tidak"}</td>
              </tr>
            ))}
            {warga.length === 0 && (
              <tr>
                <td colSpan={5} className="py-2 text-zinc-500">
                  Belum ada warga.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {pesan && <p className="text-sm text-zinc-700">{pesan}</p>}
    </div>
  );
}
