"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Home, CreditCard, Users, ClipboardList } from "lucide-react";
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
    <aside className="hidden w-64 border-r border-border bg-card md:flex md:flex-col">
      <div className="border-b border-border px-4 py-4">
        <p className="text-sm font-semibold text-text">Smart Gate</p>
        <p className="text-xs text-muted">Manajemen Perumahan</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-2 py-3 text-sm">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                active ? "bg-primary text-text" : "text-text/90 hover:bg-zinc-100",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-4 py-3 text-xs text-muted">
        {role ? `Login sebagai ${role}` : "Belum login"}
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
              active ? "bg-primary text-text" : "text-text/80 hover:bg-zinc-100",
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
