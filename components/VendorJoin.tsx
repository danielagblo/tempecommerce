"use client";

import { useState, type FormEvent } from "react";

const KEY = "oriel-vendor-requests";

const terms = [
  {
    index: "01",
    title: "The lot",
    copy: "Name the piece, the material, and how many you can actually ship.",
  },
  {
    index: "02",
    title: "The carton",
    copy: "Packed weight and dimensions stay on the page, so freight is not a surprise.",
  },
  {
    index: "03",
    title: "The half",
    copy: "Buyers pay 50% when they order and 50% on this site after the shipment arrives.",
  },
];

type VendorRequest = {
  workshop: string;
  name: string;
  email: string;
  city: string;
  craft: string;
  note: string;
};

const empty: VendorRequest = {
  workshop: "",
  name: "",
  email: "",
  city: "",
  craft: "",
  note: "",
};

export function VendorJoin() {
  const [form, setForm] = useState<VendorRequest>(empty);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<VendorRequest | null>(null);

  function setField(key: keyof VendorRequest, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.workshop.trim().length < 2) {
      setError("Enter the workshop name.");
      return;
    }
    if (form.name.trim().length < 2) {
      setError("Enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter an email we can reply to.");
      return;
    }
    if (form.city.trim().length < 2) {
      setError("Enter the city where the workshop sits.");
      return;
    }
    if (form.craft.trim().length < 2) {
      setError("Say what the workshop makes.");
      return;
    }

    const request: VendorRequest = {
      workshop: form.workshop.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      city: form.city.trim(),
      craft: form.craft.trim(),
      note: form.note.trim(),
    };

    try {
      const raw = window.localStorage.getItem(KEY);
      const existing = raw ? (JSON.parse(raw) as VendorRequest[]) : [];
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
    <section id="vendors" className="scroll-mt-28 border-b border-line">
      <div className="mx-auto grid w-full max-w-6xl gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-20 lg:py-28">
        <div>
          <p className="eyebrow">Open to makers</p>
          <h2 className="mt-4 max-w-lg font-serif text-5xl leading-[0.95] tracking-tight sm:text-6xl">
            List your workshop
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
            Oriel keeps a short edit, not an open catalogue. If you can stand behind the piece, the
            carton, and an honest transit window, there is a seat.
          </p>
          <ol className="mt-12 divide-y divide-line border-y border-line">
            {terms.map((term) => (
              <li key={term.index} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
                <span className="nums font-serif text-lg text-muted">{term.index}</span>
                <div>
                  <p className="font-serif text-2xl tracking-tight">{term.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{term.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-[28px] border border-line bg-elevated p-6 sm:p-8">
          {sent ? (
            <div>
              <p className="eyebrow">Request received</p>
              <p className="mt-4 font-serif text-4xl tracking-tight">{sent.workshop}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {sent.name} in {sent.city}. A reply goes to {sent.email}. The request is kept on
                this device until the store database is connected.
              </p>
              <button type="button" className="btn-secondary mt-8" onClick={() => setSent(null)}>
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <p className="eyebrow">Request a listing</p>
              <p className="mt-3 font-serif text-3xl tracking-tight">Tell us the workshop</p>
              <div className="mt-6 space-y-3">
                <label className="block text-xs text-muted" htmlFor="vendor-workshop">
                  Workshop
                  <input
                    id="vendor-workshop"
                    className="field mt-1"
                    value={form.workshop}
                    onChange={(event) => setField("workshop", event.target.value)}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-muted" htmlFor="vendor-name">
                    Your name
                    <input
                      id="vendor-name"
                      className="field mt-1"
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => setField("name", event.target.value)}
                    />
                  </label>
                  <label className="block text-xs text-muted" htmlFor="vendor-email">
                    Email
                    <input
                      id="vendor-email"
                      type="email"
                      className="field mt-1"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => setField("email", event.target.value)}
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-muted" htmlFor="vendor-city">
                    City
                    <input
                      id="vendor-city"
                      className="field mt-1"
                      value={form.city}
                      onChange={(event) => setField("city", event.target.value)}
                    />
                  </label>
                  <label className="block text-xs text-muted" htmlFor="vendor-craft">
                    What you make
                    <input
                      id="vendor-craft"
                      className="field mt-1"
                      value={form.craft}
                      onChange={(event) => setField("craft", event.target.value)}
                    />
                  </label>
                </div>
                <label className="block text-xs text-muted" htmlFor="vendor-note">
                  A note, if you wish
                  <textarea
                    id="vendor-note"
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
                Request a listing
              </button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Half on the order, half after arrival. No listing fee on this page.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
