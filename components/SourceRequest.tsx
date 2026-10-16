"use client";

import { useState, type FormEvent } from "react";

const KEY = "oriel-source-requests";

type SourceRequestForm = {
  want: string;
  name: string;
  email: string;
  budget: string;
  note: string;
};

const empty: SourceRequestForm = {
  want: "",
  name: "",
  email: "",
  budget: "",
  note: "",
};

export function SourceRequest() {
  const [form, setForm] = useState<SourceRequestForm>(empty);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<SourceRequestForm | null>(null);

  function setField(key: keyof SourceRequestForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.want.trim().length < 3) {
      setError("Tell her what you want.");
      return;
    }
    if (form.name.trim().length < 2) {
      setError("Add your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("That email doesn't look right.");
      return;
    }

    const request: SourceRequestForm = {
      want: form.want.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      budget: form.budget.trim(),
      note: form.note.trim(),
    };

    try {
      const raw = window.localStorage.getItem(KEY);
      const existing = raw ? (JSON.parse(raw) as SourceRequestForm[]) : [];
      const next = Array.isArray(existing) ? [request, ...existing] : [request];
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      setError("Couldn't save that on this phone.");
      return;
    }

    setSent(request);
    setForm(empty);
    setError(null);
  }

  return (
    <section id="source" className="scroll-mt-28 border-t border-line">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <h2 className="font-serif text-2xl tracking-tight">Want something else?</h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Drop what you&apos;re looking for. She&apos;ll find it, then you pay half to start.
        </p>
        {sent ? (
          <div className="mt-5">
            <p className="text-sm">
              Sent: {sent.want}. She&apos;ll get back to you at {sent.email}. It&apos;s saved on this
              device for now.
            </p>
            <button type="button" className="btn-secondary mt-4" onClick={() => setSent(null)}>
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
            <label className="block text-xs text-muted" htmlFor="source-want">
              What do you want?
              <input
                id="source-want"
                className="field mt-1"
                value={form.want}
                onChange={(event) => setField("want", event.target.value)}
                placeholder="Stoneware bowls"
              />
            </label>
            <label className="block text-xs text-muted" htmlFor="source-name">
              Name
              <input
                id="source-name"
                className="field mt-1"
                autoComplete="name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
              />
            </label>
            <label className="block text-xs text-muted" htmlFor="source-email">
              Email
              <input
                id="source-email"
                type="email"
                className="field mt-1"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setField("email", event.target.value)}
              />
            </label>
            <button type="submit" className="btn-primary sm:mb-0.5">
              Send
            </button>
            {error ? (
              <p role="alert" className="text-sm text-signal sm:col-span-4">
                {error}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
