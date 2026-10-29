import { Suspense } from "react";
import LogClient from "./log-client";
import { AppShell } from "@/components/app-shell";
import { dapatkanSesi } from "@/lib/require-admin";

export default function LogAksesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <LogAksesShell />
    </Suspense>
  );
}

async function LogAksesShell() {
  const sesi = await dapatkanSesi();
  if (!sesi || sesi.role !== "admin") {
    return (
      <AppShell role={(sesi?.role as any) ?? null} subtitle="Log Akses">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-[16px] border border-border bg-card p-6 text-center shadow-soft">
            <p className="text-sm text-text">Hanya admin yang dapat melihat log akses.</p>
          </div>
        </div>
      </AppShell>
    );
  }
  return (
    <AppShell role={sesi.role as any} subtitle="Log Akses">
      <LogClient />
    </AppShell>
  );
}
