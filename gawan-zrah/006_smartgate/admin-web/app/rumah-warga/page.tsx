import { Suspense } from "react";
import WargaRumahClient from "../warga-rumah";
import { AppShell } from "@/components/app-shell";
import { dapatkanSesi } from "@/lib/require-admin";
import { queryAs } from "@/lib/db";

export default function RumahWargaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <RumahWargaShell />
    </Suspense>
  );
}

async function RumahWargaShell() {
  const sesi = await dapatkanSesi();
  if (!sesi || sesi.role !== "admin") {
    return (
      <AppShell role={(sesi?.role as any) ?? null} subtitle="Rumah & Warga">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-[16px] border border-border bg-card p-6 text-center shadow-soft">
            <p className="text-sm text-text">Hanya admin yang dapat mengelola rumah & warga.</p>
          </div>
        </div>
      </AppShell>
    );
  }
  const [rumah, warga] = await Promise.all([
    queryAs<any>({ role: sesi.role, userId: sesi.profileId }, "select * from houses order by blok, nomor"),
    queryAs<any>({ role: sesi.role, userId: sesi.profileId }, "select * from residents order by nama"),
  ]);
  return (
    <AppShell role={sesi.role as any} subtitle="Rumah & Warga">
      <WargaRumahClient rumah={rumah as any} warga={warga as any} />
    </AppShell>
  );
}
