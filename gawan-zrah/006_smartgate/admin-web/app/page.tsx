import { Suspense } from "react";
import DbStatus from "./db-status";
import LoginBox from "./login-box";
import { query } from "@/lib/db";
import { dapatkanSesi } from "@/lib/require-admin";
import { AppShell } from "@/components/app-shell";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <DashboardShell />
    </Suspense>
  );
}

async function DashboardShell() {
  const sesi = await dapatkanSesi();
  return (
    <AppShell role={(sesi?.role as any) ?? null} subtitle={sesi ? `Login sebagai ${sesi.role}` : "Akses publik"}>
      <section aria-label="Status database">
        <Suspense fallback={<p className="text-sm text-muted">Memeriksa koneksi database...</p>}>
          <DbStatus />
        </Suspense>
      </section>

      <LoginBox />

      <Suspense fallback={<p className="text-sm text-muted">Memuat ringkasan...</p>}>
        <Ringkasan />
      </Suspense>
    </AppShell>
  );
}

async function Ringkasan() {
  try {
    const [houses, residents, cards, logs, guests, visits] = await Promise.all([
      query<{ count: number }>("select count(*)::int as count from houses"),
      query<{ count: number }>("select count(*)::int as count from residents"),
      query<{ count: number }>("select count(*)::int as count from cards"),
      query<{ count: number }>("select count(*)::int as count from access_logs"),
      query<{ count: number }>("select count(*)::int as count from guests"),
      query<{ count: number }>("select count(*)::int as count from guest_visits"),
    ]);
    return (
      <section className="grid gap-3 rounded-[16px] border border-border bg-card p-4 shadow-soft md:grid-cols-3">
        <div>
          <p className="text-xs text-muted">Rumah</p>
          <p className="text-lg font-semibold text-text">{houses[0]?.count ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Warga</p>
          <p className="text-lg font-semibold text-text">{residents[0]?.count ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Kartu</p>
          <p className="text-lg font-semibold text-text">{cards[0]?.count ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Log Akses</p>
          <p className="text-lg font-semibold text-text">{logs[0]?.count ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Tamu (profil)</p>
          <p className="text-lg font-semibold text-text">{guests[0]?.count ?? 0}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Kunjungan</p>
          <p className="text-lg font-semibold text-text">{visits[0]?.count ?? 0}</p>
        </div>
      </section>
    );
  } catch {
    return <p className="text-sm text-muted">Tidak bisa memuat ringkasan (periksa login dan koneksi database).</p>;
  }
}
