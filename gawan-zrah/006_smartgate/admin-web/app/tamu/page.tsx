import { Suspense } from "react";
import TamuClient from "./tamu-client";
import { AppShell } from "@/components/app-shell";
import { dapatkanSesi } from "@/lib/require-admin";

export default function TamuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <TamuShell />
    </Suspense>
  );
}

async function TamuShell() {
  const sesi = await dapatkanSesi();
  if (!sesi || (sesi.role !== "admin" && sesi.role !== "satpam")) {
    return (
      <AppShell role={(sesi?.role as any) ?? null} subtitle="Tamu">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-[16px] border border-border bg-card p-6 text-center shadow-soft">
            <p className="text-sm text-text">Login sebagai admin atau satpam untuk mengelola data tamu.</p>
          </div>
        </div>
      </AppShell>
    );
  }
  return (
    <AppShell role={sesi.role as any} subtitle="Tamu">
      <TamuClient />
    </AppShell>
  );
}
