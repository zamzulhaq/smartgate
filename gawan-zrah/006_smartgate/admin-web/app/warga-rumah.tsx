"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STATUS_HUNIAN, STATUS_KELUARGA, type Rumah, type StatusHunian, type StatusKeluarga, type Warga } from "@/lib/types";

export default function WargaRumah({
  rumah,
  warga,
}: {
  rumah: Rumah[];
  warga: Warga[];
}) {
  const router = useRouter();
  const [pesan, setPesan] = useState("");

  // Edit rumah
  const [editRumahId, setEditRumahId] = useState("");
  const [editBlok, setEditBlok] = useState("");
  const [editNomor, setEditNomor] = useState("");
  const [editStatusH, setEditStatusH] = useState<StatusHunian>("pemilik");
  const [editCatatan, setEditCatatan] = useState("");

  // Edit warga
  const [editWargaId, setEditWargaId] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editHouseId, setEditHouseId] = useState("");
  const [editStatusK, setEditStatusK] = useState<StatusKeluarga>("kepala_keluarga");
  const [editNoHp, setEditNoHp] = useState("");
  const [editAktif, setEditAktif] = useState(true);

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

  async function mulaiEditRumah(item: Rumah) {
    setEditRumahId(item.id);
    setEditBlok(item.blok);
    setEditNomor(item.nomor);
    setEditStatusH(item.status_hunian);
    setEditCatatan(item.catatan ?? "");
    setPesan("");
  }

  function batalEditRumah() {
    setEditRumahId("");
    setEditBlok("");
    setEditNomor("");
    setEditCatatan("");
  }

  async function simpanEditRumah(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasil = await fetch("/api/houses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editRumahId,
        blok: editBlok,
        nomor: editNomor,
        status_hunian: editStatusH,
        catatan: editCatatan,
      }),
    });
    const data = await hasil.json();
    setPesan(hasil.ok ? "Rumah berhasil diperbarui." : (data.error ?? "Gagal mengubah rumah."));
    if (hasil.ok) {
      batalEditRumah();
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

  async function mulaiEditWarga(item: Warga) {
    setEditWargaId(item.id);
    setEditNama(item.nama);
    setEditHouseId(item.house_id);
    setEditStatusK(item.status_keluarga);
    setEditNoHp(item.no_hp ?? "");
    setEditAktif(item.aktif);
    setPesan("");
  }

  function batalEditWarga() {
    setEditWargaId("");
    setEditNama("");
    setEditHouseId("");
    setEditNoHp("");
    setEditAktif(true);
  }

  async function simpanEditWarga(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasil = await fetch("/api/residents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editWargaId,
        house_id: editHouseId,
        nama: editNama,
        status_keluarga: editStatusK,
        no_hp: editNoHp,
        aktif: editAktif,
      }),
    });
    const data = await hasil.json();
    setPesan(hasil.ok ? "Warga berhasil diperbarui." : (data.error ?? "Gagal mengubah warga."));
    if (hasil.ok) {
      batalEditWarga();
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

        {editRumahId && (
          <form onSubmit={simpanEditRumah} className="flex flex-wrap items-end gap-3 rounded border border-zinc-200 p-3">
            <span className="w-full text-sm font-medium text-zinc-700">Edit Rumah</span>
            <label className="flex flex-col gap-1 text-sm">
              Blok
              <input value={editBlok} onChange={(e) => setEditBlok(e.target.value)} required className="rounded border border-zinc-300 px-2 py-1" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Nomor
              <input value={editNomor} onChange={(e) => setEditNomor(e.target.value)} required className="rounded border border-zinc-300 px-2 py-1" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Status Hunian
              <select value={editStatusH} onChange={(e) => setEditStatusH(e.target.value as StatusHunian)} className="rounded border border-zinc-300 px-2 py-1">
                {STATUS_HUNIAN.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Catatan
              <input value={editCatatan} onChange={(e) => setEditCatatan(e.target.value)} className="rounded border border-zinc-300 px-2 py-1" />
            </label>
            <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
              Simpan
            </button>
            <button type="button" onClick={batalEditRumah} className="rounded border border-zinc-300 px-3 py-1 text-sm">
              Batal
            </button>
          </form>
        )}

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="py-2">Blok</th>
              <th className="py-2">Nomor</th>
              <th className="py-2">Status Hunian</th>
              <th className="py-2">Catatan</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rumah.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-2">{item.blok}</td>
                <td className="py-2">{item.nomor}</td>
                <td className="py-2">{item.status_hunian}</td>
                <td className="py-2">{item.catatan ?? "-"}</td>
                <td className="py-2">
                  <button type="button" onClick={() => mulaiEditRumah(item)} className="text-zinc-700 underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {rumah.length === 0 && (
              <tr>
                <td colSpan={5} className="py-2 text-zinc-500">
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

        {editWargaId && (
          <form onSubmit={simpanEditWarga} className="flex flex-wrap items-end gap-3 rounded border border-zinc-200 p-3">
            <span className="w-full text-sm font-medium text-zinc-700">Edit Warga</span>
            <label className="flex flex-col gap-1 text-sm">
              Nama
              <input value={editNama} onChange={(e) => setEditNama(e.target.value)} required className="rounded border border-zinc-300 px-2 py-1" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Rumah
              <select value={editHouseId} onChange={(e) => setEditHouseId(e.target.value)} required className="rounded border border-zinc-300 px-2 py-1">
                {rumah.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.blok} {item.nomor}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Status Keluarga
              <select value={editStatusK} onChange={(e) => setEditStatusK(e.target.value as StatusKeluarga)} className="rounded border border-zinc-300 px-2 py-1">
                {STATUS_KELUARGA.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              No HP
              <input value={editNoHp} onChange={(e) => setEditNoHp(e.target.value)} className="rounded border border-zinc-300 px-2 py-1" />
            </label>
            <label className="flex items-center gap-2 pb-1 text-sm">
              <input type="checkbox" checked={editAktif} onChange={(e) => setEditAktif(e.target.checked)} />
              Aktif
            </label>
            <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
              Simpan
            </button>
            <button type="button" onClick={batalEditWarga} className="rounded border border-zinc-300 px-3 py-1 text-sm">
              Batal
            </button>
          </form>
        )}

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="py-2">Nama</th>
              <th className="py-2">Rumah</th>
              <th className="py-2">Status Keluarga</th>
              <th className="py-2">No HP</th>
              <th className="py-2">Aktif</th>
              <th className="py-2"></th>
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
                <td className="py-2">
                  <button type="button" onClick={() => mulaiEditWarga(item)} className="text-zinc-700 underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {warga.length === 0 && (
              <tr>
                <td colSpan={6} className="py-2 text-zinc-500">
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
