"use client";

import Link from "next/link";
import { Home, Users, CreditCard, ClipboardList, ArrowRight, UserPlus } from "lucide-react";

type StatCard = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
};

export function DashboardCards({
  stats,
}: {
  stats: {
    rumah: number;
    warga: number;
    kartu: number;
    tamu: number;
    kunjungan: number;
  };
}) {
  const cards: StatCard[] = [
    { label: "Total Unit Rumah", value: stats.rumah, icon: Home, href: "/rumah-warga" },
    { label: "Total Warga Terdaftar", value: stats.warga, icon: Users, href: "/rumah-warga" },
    { label: "Kartu Akses RFID", value: stats.kartu, icon: CreditCard, href: "/kartu" },
    { label: "Profil Tamu Terdaftar", value: stats.tamu, icon: UserPlus, href: "/tamu" },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.label}
            href={card.href}
            className="group relative overflow-hidden rounded-[20px] border border-border bg-card p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50">
                <Icon className="h-6 w-6 text-text" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{card.label}</p>
              <p className="mt-1 text-[32px] font-extrabold tracking-tight text-text">{card.value.toLocaleString("id-ID")}</p>
              <p className="mt-2 text-xs text-muted">Lihat detail</p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}

export function QuickLinks() {
  return (
    <section className="rounded-[20px] border border-border bg-card p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Aksi Cepat</h2>
          <p className="text-sm text-muted">Navigasi ke modul operasional</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
        <Link href="/tamu" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm text-text transition-colors hover:bg-zinc-50">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Check-in Tamu</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </Link>
        <Link href="/log-akses" className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm text-text transition-colors hover:bg-zinc-50">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Lihat Log Akses</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted" />
        </Link>
      </div>
    </section>
  );
}
