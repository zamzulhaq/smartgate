import { Suspense } from "react";
import { query, queryAs } from "@/lib/db";
import { dapatkanSesi } from "@/lib/require-admin";
import { AppShell } from "@/components/app-shell";
import { DashboardCards, QuickLinks } from "./dashboard-cards";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <DashboardShell />
    </Suspense>
  );
}

async function DashboardShell() {
  const sesi = await dapatkanSesi();
  if (!sesi) {
    const { default: LoginBox } = await import("./login-box");
    return <LoginBox />;
  }
  if (sesi.role === "satpam") {
    return (
      <AppShell role={"satpam"} subtitle="Pos Satpam">
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-semibold text-text md:text-2xl">Dashboard Satpam</h1>
            <p className="text-sm text-muted">Akses cepat untuk check-in tamu</p>
          </div>
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <p className="text-sm text-text">Gunakan menu Tamu untuk melakukan check-in tamu baru atau lama.</p>
            <Link href="/tamu" className="mt-4 inline-flex items-center rounded-pill bg-primary px-5 py-2 text-sm font-semibold text-text">
              Buka Halaman Tamu
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }
  return (
    <AppShell role={"admin"} subtitle="Dashboard Admin">
      <Suspense fallback={<p className="text-sm text-muted">Memuat dashboard...</p>}>
        <DashboardAdmin />
      </Suspense>
    </AppShell>
  );
}

async function DashboardAdmin() {
  const sesi = await dapatkanSesi();
  if (!sesi || sesi.role !== "admin") return null;
  try {
    const [houses, residents, cards, guests] = await Promise.all([
      query<{ count: number }>("select count(*)::int as count from houses"),
      queryAs<{ count: number }>({ role: sesi.role, userId: sesi.profileId }, "select count(*)::int as count from residents"),
      queryAs<{ count: number }>({ role: sesi.role, userId: sesi.profileId }, "select count(*)::int as count from cards"),
      queryAs<{ count: number }>({ role: sesi.role, userId: sesi.profileId }, "select count(*)::int as count from guests"),
    ]);
    return (
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-text md:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted">Ringkasan data hunian, warga, kartu akses, dan tamu</p>
        </div>
        <DashboardCards
          stats={{
            rumah: houses[0]?.count ?? 0,
            warga: residents[0]?.count ?? 0,
            kartu: cards[0]?.count ?? 0,
            tamu: guests[0]?.count ?? 0,
            kunjungan: 0,
          }}
        />
        <QuickLinks />
      </section>
    );
  } catch {
    return <p className="text-sm text-muted">Tidak bisa memuat dashboard.</p>;
  }
}
