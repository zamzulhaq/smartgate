"use client";

import { useState } from "react";

export default function LoginBox() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pesan, setPesan] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setPesan("");
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
  }

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <section className="flex flex-col gap-3 rounded border border-zinc-200 p-4">
      <h2 className="text-lg font-semibold text-zinc-900">Login Admin</h2>
      <form onSubmit={login} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="rounded border border-zinc-300 px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Kata sandi
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            className="rounded border border-zinc-300 px-2 py-1"
          />
        </label>
        <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">
          Masuk
        </button>
        <button type="button" onClick={logout} className="rounded border border-zinc-300 px-3 py-1 text-sm">
          Keluar
        </button>
      </form>
      {pesan && <p className="text-sm text-zinc-700">{pesan}</p>}
    </section>
  );
}
