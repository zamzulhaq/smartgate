"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Home, CreditCard, Users, ClipboardList, ShieldCheck } from "lucide-react";
import { cn } from "@/components/ui/cn";

type Role = "admin" | "satpam" | "warga" | null;

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Array<"admin" | "satpam">;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "satpam"] },
  { href: "/rumah-warga", label: "Rumah & Warga", icon: Home, roles: ["admin"] },
  { href: "/kartu", label: "Kartu Akses", icon: CreditCard, roles: ["admin"] },
  { href: "/tamu", label: "Tamu", icon: Users, roles: ["admin", "satpam"] },
  { href: "/log-akses", label: "Log Akses", icon: ClipboardList, roles: ["admin"] },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  const items = navItems.filter((item) => role && (item.roles as string[]).includes(role));

  return (
    <aside className="hidden w-72 border-r border-border bg-card shadow-[0_1px_8px_rgba(0,0,0,0.04)] md:fixed md:left-0 md:top-0 md:h-screen md:flex md:flex-col">
      <div className="flex flex-col px-6 pb-6 pt-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/90">
            <ShieldCheck className="h-5 w-5 text-text" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight text-text">GatePro</span>
            <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Smart Access</span>
          </div>
        </div>
        <div className="mt-6 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Menu Operasional</span>
        </div>
        <nav className="flex flex-col gap-1.5">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-all",
                  active
                    ? "bg-primary/90 text-text font-semibold shadow-[0_2px_12px_rgba(198,237,66,0.25)]"
                    : "text-text/90 hover:bg-zinc-100 font-medium",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto px-4 pb-6">
        <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-text shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-tight text-text">Gerbang Utama</div>
              <div className="mt-0.5 text-[11px] text-muted">Pos 1 Barrier Gate</div>
            </div>
          </div>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary"></span>
          </span>
        </div>
        <div className="mt-3 px-2 text-xs text-muted">{role ? `Login sebagai ${role}` : "Belum login"}</div>
      </div>
    </aside>
  );
}

export function MobileNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => role && (item.roles as string[]).includes(role));

  return (
    <nav className="md:hidden flex items-center gap-2 overflow-x-auto border-t border-border bg-card px-2 py-1 text-xs">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-pill px-2 py-1",
              active ? "bg-primary/90 text-text" : "text-text/80 hover:bg-zinc-100",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
