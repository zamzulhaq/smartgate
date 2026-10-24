import { Suspense } from "react";
import KartuClient from "./kartu-client";
import { dapatkanSesi } from "@/lib/require-admin";
import Link from "next/link";

export default function CardsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Memuat...</p>}>
      <CardsShell />
    </Suspense>
  );
}

async function CardsShell() {
  const sesi = await dapatkanSesi();
  if (!sesi || sesi.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md rounded border border-zinc-200 bg-white p-6 text-center">
          <p className="text-sm text-zinc-600">Login sebagai admin untuk mengelola kartu akses.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-zinc-900 underline">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }
  return <KartuClient />;
}
