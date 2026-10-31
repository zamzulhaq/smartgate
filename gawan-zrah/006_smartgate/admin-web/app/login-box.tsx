"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

export default function LoginBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setPesan("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
        return;
      }
      setPesan(data.error ?? "Login gagal");
    } catch {
      setPesan("Login gagal");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <div className="flex items-center justify-center py-6">
      <div className="relative w-full max-w-[480px]">
        <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <section className="relative flex flex-col overflow-hidden rounded-[24px] border border-border bg-card p-6 shadow-soft sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">Gate Online · Smart Gate</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-muted">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>SSL 256-bit</span>
            </div>
          </div>

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/90 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-text" />
            </div>
            <h1 className="text-[26px] font-extrabold tracking-tight text-text">Masuk ke Sistem</h1>
            <p className="mt-1.5 max-w-sm text-[13px] text-muted">Portal Administrasi Gerbang & Manajemen Perumahan</p>
          </div>

          {pesan && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-[13px] text-red-700">
              <span className="mt-0.5">Autentikasi Gagal</span>
              <div className="flex-1">{pesan}</div>
              <button type="button" onClick={() => setPesan("")} className="text-red-400 hover:text-red-700">
                ×
              </button>
            </div>
          )}

          <form onSubmit={login} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-text" htmlFor="emailInput">
                Alamat Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 h-5 w-5 text-muted" />
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@smartgate.local"
                  className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-4 text-sm text-text placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-text" htmlFor="passwordInput">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 h-5 w-5 text-muted" />
                <input
                  id="passwordInput"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-3.5 pl-12 pr-12 text-sm text-text placeholder:text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 rounded-full p-1.5 text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-pill bg-primary px-6 text-base font-bold text-text shadow-[0_2px_12px_rgba(198,237,66,0.25)] transition-all disabled:opacity-70"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>

          <div className="mt-6 flex justify-center">
            <button type="button" onClick={logout} className="text-xs text-muted underline">
              Keluar
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
