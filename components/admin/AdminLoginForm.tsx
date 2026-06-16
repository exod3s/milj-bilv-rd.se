"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Kunde inte logga in");
      }

      router.push(searchParams.get("next") ?? "/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Kunde inte logga in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface mx-auto w-full max-w-md p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-forest-950 text-white">
        <Lock size={22} />
      </div>
      <h1 className="text-3xl font-black text-forest-950">Admin login</h1>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Logga in för att hantera priser, bokningar, kunder och galleri.
      </p>
      <label className="mt-6 block">
        <span className="field-label">Användarnamn</span>
        <input
          className="field-input mt-2"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
        />
      </label>
      <label className="mt-4 block">
        <span className="field-label">Lösenord</span>
        <input
          className="field-input mt-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
        />
      </label>
      {error ? (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <button className="button-primary mt-6 w-full" disabled={loading}>
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        Logga in
      </button>
    </form>
  );
}
