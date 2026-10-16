"use client";

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultHeroFilms, sanitizeHeroFilms, type HeroFilm } from "@/lib/hero";
import { products } from "@/lib/products";

function capturePoster(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let settled = false;
    const finish = (value: string) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(""), 4000);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    video.onerror = () => finish("");
    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.4, Number.isFinite(video.duration) ? video.duration / 2 : 0.4);
      } catch {
        finish("");
      }
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const context = canvas.getContext("2d");
      if (!context) {
        finish("");
        return;
      }
      context.drawImage(video, 0, 0, 320, 180);
      finish(canvas.toDataURL("image/jpeg", 0.72));
    };
  });
}

export function AdminHero() {
  const [films, setFilms] = useState<HeroFilm[]>(defaultHeroFilms);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch("/api/hero", { cache: "no-store" });
      if (!response.ok || cancelled) return;
      const body = (await response.json()) as { films?: unknown };
      const films = sanitizeHeroFilms(body.films);
      if (films.length) setFilms(films);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function persist(next: HeroFilm[]) {
    const response = await fetch("/api/admin/hero", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ films: next }),
    });
    if (!response.ok) throw new Error("The films could not be saved.");
  }

  async function commit(next: HeroFilm[]) {
    setFilms(next);
    setError("");
    try {
      await persist(next);
    } catch {
      setError("The films could not be saved.");
    }
  }

  function update(id: string, patch: Partial<HeroFilm>) {
    commit(films.map((film) => (film.id === id ? { ...film, ...patch } : film)));
  }

  function move(id: string, direction: -1 | 1) {
    const index = films.findIndex((film) => film.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= films.length) return;
    const next = films.slice();
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    commit(next);
  }

  async function remove(film: HeroFilm) {
    if (films.length < 2) return;
    if (film.src.startsWith("/hero-uploads/")) {
      await fetch("/api/admin/hero/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src: film.src }),
      });
    }
    await commit(films.filter((item) => item.id !== film.id));
  }

  async function restore() {
    setBusy(true);
    setError("");
    try {
      await commit(defaultHeroFilms());
    } catch {
      setError("The original films could not be restored.");
    } finally {
      setBusy(false);
    }
  }

  async function addFile(file: File) {
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.set("file", file);
      const uploaded = await fetch("/api/admin/hero/upload", { method: "POST", body });
      if (!uploaded.ok) throw new Error("upload");
      const saved = (await uploaded.json()) as { id: string; src: string };
      const poster = await capturePoster(file);
      const label = file.name.replace(/\.[^.]+$/, "") || "New film";
      await commit([
        ...films,
        { id: saved.id, label, src: saved.src, poster, productId: null, shown: true },
      ]);
    } catch {
      setError("That video could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <ul className="flex flex-col gap-4">
        {films.map((film, index) => (
          <li key={film.id} className="rounded-2xl border border-line p-4">
            <div className="flex gap-4">
              {film.poster ? (
                <img src={film.poster} alt="" className="h-20 w-32 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="h-20 w-32 shrink-0 rounded-lg bg-ink/10" />
              )}
              <div className="min-w-0 flex-1">
                <label className="text-xs text-muted" htmlFor={`label-${film.id}`}>
                  Name
                </label>
                <input
                  id={`label-${film.id}`}
                  className="field mt-1"
                  value={film.label}
                  onChange={(event) => update(film.id, { label: event.target.value })}
                />
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"
                  aria-label={`Move ${film.label} up`}
                  disabled={index === 0}
                  onClick={() => move(film.id, -1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30"
                  aria-label={`Move ${film.label} down`}
                  disabled={index === films.length - 1}
                  onClick={() => move(film.id, 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>
            <label className="mt-4 block text-xs text-muted" htmlFor={`order-${film.id}`}>
              Order button
            </label>
            <select
              id={`order-${film.id}`}
              className="field mt-1"
              value={film.productId ?? ""}
              onChange={(event) => update(film.id, { productId: event.target.value || null })}
            >
              <option value="">No order button</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
            <div className="mt-3 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={film.shown}
                  onChange={(event) => update(film.id, { shown: event.target.checked })}
                />
                Show on the homepage
              </label>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink"
                disabled={films.length < 2}
                onClick={() => remove(film)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="btn-primary cursor-pointer">
          {busy ? "Saving…" : "Add a video"}
          <input
            type="file"
            accept="video/mp4,video/*"
            className="sr-only"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void addFile(file);
            }}
          />
        </label>
        <button type="button" className="text-sm text-muted hover:text-ink" disabled={busy} onClick={() => void restore()}>
          Restore the original films
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}
    </div>
  );
}
