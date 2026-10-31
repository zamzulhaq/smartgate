"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./sidebar";

type Role = "admin" | "satpam" | "warga" | null;

export function Header({ role, subtitle }: { role: Role; subtitle?: string }) {
  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-30 flex flex-col gap-2 border-b border-border bg-card/95 px-4 py-2 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text">SmartGate</p>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        {role ? (
          <Button variant="secondary" size="sm" onClick={logout} className="gap-1">
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        ) : null}
      </div>
      <MobileNav role={role} />
    </header>
  );
}
