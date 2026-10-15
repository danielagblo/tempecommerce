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
      setError("Say what you want sourced.");
      return;
    }
    if (form.name.trim().length < 2) {
      setError("Enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter an email she can reply to.");
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
      setError("This browser could not store the request.");
      return;
    }

    setSent(request);
    setForm(empty);
    setError(null);
  }

  return (
    <section id="source" className="scroll-mt-28 border-b border-line bg-elevated">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow">Use the sourcing</p>
          <h2 className="mt-3 max-w-md font-serif text-4xl tracking-tight sm:text-5xl">
            Want something that is not in the gallery yet?
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Tell Oriel the piece. She looks for it at the workshop, then the lot shows up here with
            a photo, a price, and the same half-now, half-when-it-lands deal.
          </p>
          <ol className="mt-8 space-y-4 text-sm">
            <li>
              <span className="nums text-muted">01</span>
              <span className="ml-3">You name the piece.</span>
            </li>
            <li>
              <span className="nums text-muted">02</span>
              <span className="ml-3">Half starts the order on this site.</span>
            </li>
            <li>
              <span className="nums text-muted">03</span>
              <span className="ml-3">The rest is due when the box lands, 8–15 business days out.</span>
            </li>
          </ol>
        </div>

        <div className="rounded-[28px] border border-line bg-paper p-6 sm:p-8">
          {sent ? (
            <div>
              <p className="eyebrow">Request saved</p>
              <p className="mt-4 font-serif text-3xl tracking-tight">{sent.want}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {sent.name}
                {sent.budget ? `, around ${sent.budget}` : ""}. A reply would go to {sent.email}.
                The request stays on this device until the store database is connected.
              </p>
              <button type="button" className="btn-secondary mt-8" onClick={() => setSent(null)}>
                Ask for another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <p className="font-serif text-3xl tracking-tight">Ask her to source it</p>
              <div className="mt-6 space-y-3">
                <label className="block text-xs text-muted" htmlFor="source-want">
                  What should she find?
                  <input
                    id="source-want"
                    className="field mt-1"
                    value={form.want}
                    onChange={(event) => setField("want", event.target.value)}
                    placeholder="Stoneware bowls, a small lamp, a linen set"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-muted" htmlFor="source-name">
                    Your name
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
                </div>
                <label className="block text-xs text-muted" htmlFor="source-budget">
                  Budget, if you have one
                  <input
                    id="source-budget"
                    className="field mt-1"
                    value={form.budget}
                    onChange={(event) => setField("budget", event.target.value)}
                    placeholder="$80"
                  />
                </label>
                <label className="block text-xs text-muted" htmlFor="source-note">
                  Anything else
                  <textarea
                    id="source-note"
                    className="field mt-1 min-h-24 resize-y"
                    value={form.note}
                    onChange={(event) => setField("note", event.target.value)}
                  />
                </label>
              </div>
              {error ? (
                <p role="alert" className="mt-3 text-sm text-signal">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="btn-primary mt-5 w-full">
                Send the request
              </button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Half to start. Half when it arrives. Tracked shipping is $12 on the order.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
