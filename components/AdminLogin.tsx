"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!response.ok) {
      setError("That password is not right.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-sm">
      <label className="text-xs text-muted" htmlFor="admin-password">
        Password
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="field mt-1"
          required
        />
      </label>
      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}
      <button type="submit" className="btn-primary mt-4" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
