"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, Search, Ban, CheckCircle2 } from "lucide-react";
import { cn } from "@/components/ui/cn";

type Warga = { id: string; nama: string };
type Kartu = {
  id: string;
  resident_id: string;
  label: string | null;
  status: string;
  revoked_at: string | null;
  created_at: string;
  nama: string;
};

export default function KartuClient() {
  const router = useRouter();
  const [warga, setWarga] = useState<Warga[]>([]);
  const [kartu, setKartu] = useState<Kartu[]>([]);
  const [pesan, setPesan] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

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
        status: isi.get("status") || "aktif",
      }),
    });
    const data = await res.json();
    setPesan(res.ok ? "Kartu berhasil didaftarkan." : data.error ?? "Gagal mendaftarkan kartu.");
    if (res.ok) {
      form.reset();
      setDrawerOpen(false);
      muat();
      router.refresh();
    }
  }

  async function ubahStatus(item: Kartu, aksi: "cabut" | "aktifkan") {
    const res = await fetch(`/api/cards/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aksi }),
    });
    const data = await res.json();
    setPesan(res.ok ? (aksi === "cabut" ? "Kartu dicabut." : "Kartu diaktifkan.") : data.error ?? "Gagal mengubah status kartu.");
    if (res.ok) {
      muat();
      router.refresh();
    }
  }

  const filtered = kartu.filter((k) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return k.nama.toLowerCase().includes(q) || (k.label ?? "").toLowerCase().includes(q);
  });

  function getStatusBadge(status: string) {
    if (status === "aktif") return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Aktif</Badge>;
    if (status === "dicabut") return <Badge className="bg-red-50 text-red-700 border-red-200">Dicabut</Badge>;
    return <Badge>{status}</Badge>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text md:text-2xl">Kartu Akses</h1>
          <p className="text-sm text-muted">Kelola kartu akses RFID untuk warga (hanya admin)</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari warga atau label..." className="pl-9 w-full md:w-72" />
          </div>
          <Button onClick={() => { setPesan(""); setDrawerOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Daftarkan Kartu
          </Button>
        </div>
      </div>

      {pesan ? <p className="text-sm text-text">{pesan}</p> : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Warga</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Label</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Terdaftar</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted">Dicabut</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((k) => (
                <tr key={k.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20">
                        <CreditCard className="h-4 w-4 text-text" />
                      </div>
                      <div className="font-medium text-text">{k.nama}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text">{k.label ?? "-"}</td>
                  <td className="px-6 py-4">{getStatusBadge(k.status)}</td>
                  <td className="px-6 py-4 text-muted">{k.created_at ? new Date(k.created_at).toLocaleString("id-ID") : "-"}</td>
                  <td className="px-6 py-4 text-muted">{k.revoked_at ? new Date(k.revoked_at).toLocaleString("id-ID") : "-"}</td>
                  <td className="px-6 py-4 text-right">
                    {k.status === "aktif" ? (
                      <Button variant="ghost" size="sm" onClick={() => ubahStatus(k, "cabut")} className="gap-1 text-red-600 hover:text-red-700">
                        <Ban className="h-4 w-4" />
                        Cabut
                      </Button>
                    ) : null}
                    {k.status === "dicabut" ? (
                      <Button variant="ghost" size="sm" onClick={() => ubahStatus(k, "aktifkan")} className="gap-1 text-emerald-600 hover:text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Aktifkan
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-muted">Belum ada kartu terdaftar.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="w-full max-w-md bg-card shadow-xl flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-text">Daftarkan Kartu</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-muted hover:text-text">✕</button>
            </div>
            <form onSubmit={daftar} className="flex flex-1 flex-col gap-4 p-6 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text">Warga</label>
                <select name="resident_id" required className="rounded-[12px] border border-border px-3 py-2 text-sm">
                  <option value="">-- pilih warga --</option>
                  {warga.map((w) => (
                    <option key={w.id} value={w.id}>{w.nama}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text">UID Dummy (heks)</label>
                <Input name="uid" required placeholder="04AABBCCDD" />
                <p className="text-xs text-muted">UID tidak disimpan mentah. Hanya HMAC-SHA256 yang disimpan.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text">Label</label>
                <Input name="label" placeholder="KTP lama" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-text">Status</label>
                <select name="status" defaultValue="aktif" className="rounded-[12px] border border-border px-3 py-2 text-sm">
                  <option value="aktif">aktif</option>
                  <option value="dicabut">dicabut</option>
                  <option value="hilang">hilang</option>
                </select>
              </div>
              {pesan ? <p className="text-sm text-text">{pesan}</p> : null}
              <div className="mt-auto flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setDrawerOpen(false)} className="flex-1">Batal</Button>
                <Button type="submit" className="flex-1">Daftarkan</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
