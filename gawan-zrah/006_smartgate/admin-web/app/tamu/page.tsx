import { Suspense } from "react";
import Link from "next/link";
import TamuClient from "./tamu-client";
import { dapatkanSesi } from "@/lib/require-admin";

export default function TamuPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-zinc-500">Memuat...</p>}>
      <TamuShell />
    </Suspense>
  );
}

async function TamuShell() {
  const sesi = await dapatkanSesi();
  if (!sesi || sesi.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-md rounded border border-zinc-200 bg-white p-6 text-center">
          <p className="text-sm text-zinc-600">Login sebagai admin untuk mengelola data tamu.</p>
          <Link href="/" className="mt-3 inline-block text-sm text-zinc-900 underline">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }
  return <TamuClient />;
}
