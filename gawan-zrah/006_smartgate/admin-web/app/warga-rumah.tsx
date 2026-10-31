"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { STATUS_HUNIAN, STATUS_KELUARGA, type Rumah, type StatusHunian, type StatusKeluarga, type Warga } from "@/lib/types";
import { cn } from "@/components/ui/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Home, Users, Pencil } from "lucide-react";

export default function WargaRumah({
  rumah,
  warga,
}: {
  rumah: Rumah[];
  warga: Warga[];
}) {
  const router = useRouter();
  const [pesan, setPesan] = useState("");
  const [activeTab, setActiveTab] = useState<"rumah" | "warga">("rumah");
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer/modal state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"rumah" | "warga">("rumah");
  const [editingRumahId, setEditingRumahId] = useState("");
  const [editingWargaId, setEditingWargaId] = useState("");

  // Rumah form
  const [formBlok, setFormBlok] = useState("Blok A");
  const [formNomor, setFormNomor] = useState("");
  const [formStatusH, setFormStatusH] = useState<StatusHunian>("pemilik");
  const [formCatatan, setFormCatatan] = useState("");

  // Warga form
  const [formNama, setFormNama] = useState("");
  const [formHouseId, setFormHouseId] = useState(rumah[0]?.id ?? "");
  const [formStatusK, setFormStatusK] = useState<StatusKeluarga>("kepala_keluarga");
  const [formNoHp, setFormNoHp] = useState("");
  const [formAktif, setFormAktif] = useState(true);

  function labelRumah(houseId: string) {
    const item = rumah.find((r) => r.id === houseId);
    return item ? `${item.blok} No. ${item.nomor}` : "-";
  }

  function openTambah(mode: "rumah" | "warga") {
    setDrawerMode(mode);
    setEditingRumahId("");
    setEditingWargaId("");
    setPesan("");
    if (mode === "rumah") {
      setFormBlok("Blok A");
      setFormNomor("");
      setFormStatusH("pemilik");
      setFormCatatan("");
    } else {
      setFormNama("");
      setFormHouseId(rumah[0]?.id ?? "");
      setFormStatusK("kepala_keluarga");
      setFormNoHp("");
      setFormAktif(true);
    }
    setDrawerOpen(true);
  }

  function openEditRumah(item: Rumah) {
    setDrawerMode("rumah");
    setEditingRumahId(item.id);
    setEditingWargaId("");
    setFormBlok(item.blok);
    setFormNomor(item.nomor);
    setFormStatusH(item.status_hunian);
    setFormCatatan(item.catatan ?? "");
    setPesan("");
    setDrawerOpen(true);
  }

  function openEditWarga(item: Warga) {
    setDrawerMode("warga");
    setEditingWargaId(item.id);
    setEditingRumahId("");
    setFormNama(item.nama);
    setFormHouseId(item.house_id);
    setFormStatusK(item.status_keluarga);
    setFormNoHp(item.no_hp ?? "");
    setFormAktif(item.aktif);
    setPesan("");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (drawerMode === "rumah") {
      if (!formNomor.trim()) {
        setPesan("Nomor rumah wajib diisi");
        return;
      }
      if (editingRumahId) {
        const hasil = await fetch("/api/houses", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingRumahId,
            blok: formBlok,
            nomor: formNomor,
            status_hunian: formStatusH,
            catatan: formCatatan,
          }),
        });
        const data = await hasil.json();
        setPesan(hasil.ok ? "Rumah berhasil diperbarui." : data.error ?? "Gagal mengubah rumah.");
        if (hasil.ok) {
          closeDrawer();
          router.refresh();
        }
        return;
      }
      const hasil = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blok: formBlok,
          nomor: formNomor,
          status_hunian: formStatusH,
          catatan: formCatatan,
        }),
      });
      const data = await hasil.json();
      setPesan(hasil.ok ? "Rumah berhasil disimpan." : data.error ?? "Gagal menambah rumah.");
      if (hasil.ok) {
        closeDrawer();
        router.refresh();
      }
      return;
    }

    // warga
    if (!formNama.trim()) {
      setPesan("Nama wajib diisi");
      return;
    }
    if (!formHouseId) {
      setPesan("Pilih rumah");
      return;
    }
    if (editingWargaId) {
      const hasil = await fetch("/api/residents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingWargaId,
          house_id: formHouseId,
          nama: formNama,
          status_keluarga: formStatusK,
          no_hp: formNoHp,
          aktif: formAktif,
        }),
      });
      const data = await hasil.json();
      setPesan(hasil.ok ? "Warga berhasil diperbarui." : data.error ?? "Gagal mengubah warga.");
      if (hasil.ok) {
        closeDrawer();
        router.refresh();
      }
      return;
    }
    const hasil = await fetch("/api/residents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        house_id: formHouseId,
        nama: formNama,
        status_keluarga: formStatusK,
        no_hp: formNoHp,
        aktif: formAktif,
      }),
    });
    const data = await hasil.json();
    setPesan(hasil.ok ? "Warga berhasil disimpan." : data.error ?? "Gagal menambah warga.");
    if (hasil.ok) {
      closeDrawer();
      router.refresh();
    }
  }

  const filteredRumah = useMemo(() => {
    if (!searchQuery) return rumah;
    const q = searchQuery.toLowerCase();
    return rumah.filter((r) => `${r.blok} ${r.nomor}`.toLowerCase().includes(q) || (r.catatan ?? "").toLowerCase().includes(q));
  }, [rumah, searchQuery]);

  const filteredWarga = useMemo(() => {
    if (!searchQuery) return warga;
    const q = searchQuery.toLowerCase();
    return warga.filter((w) => w.nama.toLowerCase().includes(q) || labelRumah(w.house_id).toLowerCase().includes(q));
  }, [warga, searchQuery, rumah]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text md:text-2xl">Rumah &amp; Warga</h1>
          <p className="text-sm text-muted">Kelola unit hunian dan penghuni perumahan</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari rumah atau warga..." className="pl-9 w-full md:w-72" />
          </div>
          <Button onClick={() => openTambah(activeTab)} className="gap-2">
            <Plus className="h-4 w-4" />
            {activeTab === "rumah" ? "Tambah Rumah" : "Tambah Warga"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-pill bg-zinc-100 p-1 w-fit">
        <button onClick={() => setActiveTab("rumah")} className={cn("flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm", activeTab === "rumah" ? "bg-card text-text shadow-sm" : "text-muted")}>
          <Home className="h-4 w-4" />
          Rumah ({rumah.length})
        </button>
        <button onClick={() => setActiveTab("warga")} className={cn("flex items-center gap-2 rounded-pill px-4 py-1.5 text-sm", activeTab === "warga" ? "bg-card text-text shadow-sm" : "text-muted")}>
          <Users className="h-4 w-4" />
          Warga ({warga.length})
        </button>
      </div>

      {pesan ? <p className="text-sm text-text">{pesan}</p> : null}

      {activeTab === "rumah" ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status Hunian</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Catatan</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRumah.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-medium text-text">{r.blok} No. {r.nomor}</td>
                    <td className="px-6 py-4">
                      <Badge>{r.status_hunian}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted">{r.catatan || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditRumah(r)} className="gap-1">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Rumah</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status Keluarga</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">No. HP</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredWarga.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4 font-medium text-text">{w.nama}</td>
                    <td className="px-6 py-4 text-text">{labelRumah(w.house_id)}</td>
                    <td className="px-6 py-4">
                      <Badge>{w.status_keluarga.replace("_", " ")}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted">{w.no_hp || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={cn("text-xs", w.aktif ? "text-emerald-600" : "text-muted")}>{w.aktif ? "Aktif" : "Tidak Aktif"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEditWarga(w)} className="gap-1">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={closeDrawer} />
          <div className="w-full max-w-md bg-card shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-text">
                {drawerMode === "rumah" ? (editingRumahId ? "Edit Rumah" : "Tambah Rumah") : (editingWargaId ? "Edit Warga" : "Tambah Warga")}
              </h2>
              <button onClick={closeDrawer} className="text-muted hover:text-text">✕</button>
            </div>
            <form onSubmit={submitForm} className="flex flex-1 flex-col gap-4 p-6 overflow-y-auto">
              {drawerMode === "rumah" ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">Blok</label>
                    <select value={formBlok} onChange={(e) => setFormBlok(e.target.value)} className="rounded-[12px] border border-border px-3 py-2 text-sm">
                      <option>Blok A</option>
                      <option>Blok B</option>
                      <option>Blok C</option>
                      <option>Blok D</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">Nomor Rumah</label>
                    <Input value={formNomor} onChange={(e) => setFormNomor(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">Status Hunian</label>
                    <select value={formStatusH} onChange={(e) => setFormStatusH(e.target.value as StatusHunian)} className="rounded-[12px] border border-border px-3 py-2 text-sm">
                      {STATUS_HUNIAN.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">Catatan</label>
                    <Input value={formCatatan} onChange={(e) => setFormCatatan(e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">Nama Lengkap</label>
                    <Input value={formNama} onChange={(e) => setFormNama(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">Rumah</label>
                    <select value={formHouseId} onChange={(e) => setFormHouseId(e.target.value)} className="rounded-[12px] border border-border px-3 py-2 text-sm">
                      {rumah.map((r) => (
                        <option key={r.id} value={r.id}>{r.blok} No. {r.nomor}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">Hubungan Keluarga</label>
                    <select value={formStatusK} onChange={(e) => setFormStatusK(e.target.value as StatusKeluarga)} className="rounded-[12px] border border-border px-3 py-2 text-sm">
                      {STATUS_KELUARGA.map((s) => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-text">No. HP</label>
                    <Input value={formNoHp} onChange={(e) => setFormNoHp(e.target.value)} />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-text">
                    <input type="checkbox" checked={formAktif} onChange={(e) => setFormAktif(e.target.checked)} />
                    Aktif
                  </label>
                </>
              )}
              {pesan ? <p className="text-sm text-text">{pesan}</p> : null}
              <div className="mt-auto flex gap-2">
                <Button type="button" variant="secondary" onClick={closeDrawer} className="flex-1">Batal</Button>
                <Button type="submit" className="flex-1">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
