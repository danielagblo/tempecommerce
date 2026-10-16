"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/CartContext";
import { useLot } from "@/components/StockFigure";
import {
  HERO_EVENT,
  defaultHeroFilms,
  filmsForHomepage,
  readHeroBlob,
  readHeroFilms,
  sanitizeHeroFilms,
  type HeroFilm,
} from "@/lib/hero";
import { getProduct } from "@/lib/products";
import type { Product } from "@/lib/types";

export const HERO_SOUND_EVENT = "oriel-hero-sound";

type PlayableFilm = HeroFilm & { playSrc: string };

function HeroOrderButton({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const { left } = useLot(product);
  const soldOut = left < 1;

  return (
    <button
      type="button"
      className="hero-order-enter btn-primary shadow-lift"
      disabled={soldOut}
      onClick={() => {
        addItem({ ...product, stock_quantity: left }, 1);
        openCart();
      }}
    >
      {soldOut ? "Sold through" : `Order · ${product.title}`}
    </button>
  );
}

export function HeroVideo() {
  const activeRef = useRef<HTMLVideoElement>(null);
  const mutedRef = useRef(true);
  const urlsRef = useRef<Record<string, string>>({});
  const [films, setFilms] = useState<HeroFilm[]>(defaultHeroFilms);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0);
  const [layers, setLayers] = useState<number[]>([0]);
  const [visible, setVisible] = useState(5);

  const playable: PlayableFilm[] = films.flatMap((film) => {
    const playSrc = film.src.startsWith("idb:") ? urls[film.id] ?? "" : film.src;
    return playSrc ? [{ ...film, playSrc }] : [];
  });
  const count = playable.length;
  const maxStart = Math.max(0, count - visible);
  const start = Math.min(maxStart, Math.max(0, active - Math.floor(visible / 2)));
  const thumbRem = visible > 3 ? 9 : 7;
  const gapRem = 0.5;
  const current = playable[active];
  const orderProduct = current?.productId ? getProduct(current.productId) : undefined;

  useEffect(() => {
    let token = 0;
    async function load() {
      const mine = ++token;
      let list = readHeroFilms();
      try {
        const response = await fetch("/api/hero", { cache: "no-store" });
        if (response.ok) {
          const body = (await response.json()) as { films?: unknown };
          const films = sanitizeHeroFilms(body.films);
          if (films.length) list = films;
        }
      } catch {
        list = readHeroFilms();
      }
      const next = filmsForHomepage(list);
      const map: Record<string, string> = {};
      for (const film of next) {
        if (!film.src.startsWith("idb:")) continue;
        const blob = await readHeroBlob(film.id).catch(() => null);
        if (!blob || mine !== token) continue;
        map[film.id] = URL.createObjectURL(blob);
      }
      if (mine !== token) {
        Object.values(map).forEach((url) => URL.revokeObjectURL(url));
        return;
      }
      Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = map;
      setUrls(map);
      setFilms(next);
      setActive(0);
      setLayers([0]);
    }
    load();
    window.addEventListener(HERO_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      token += 1;
      window.removeEventListener(HERO_EVENT, load);
      window.removeEventListener("storage", load);
      Object.values(urlsRef.current).forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const apply = () => setVisible(query.matches ? 5 : 3);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    function onToggle(event: Event) {
      const video = activeRef.current;
      if (!video) return;
      const wantMuted = (event as CustomEvent<boolean>).detail;
      mutedRef.current = wantMuted;
      video.muted = wantMuted;
      video.volume = 1;
      if (!wantMuted) {
        video.play().catch(() => {
          video.muted = true;
          mutedRef.current = true;
          window.dispatchEvent(new CustomEvent("oriel-hero-sound-state", { detail: true }));
        });
      }
    }
    window.addEventListener(HERO_SOUND_EVENT, onToggle);
    return () => window.removeEventListener(HERO_SOUND_EVENT, onToggle);
  }, []);

  useEffect(() => {
    const video = activeRef.current;
    if (!video) return;
    video.muted = mutedRef.current;
    const play = video.play();
    if (!play) return;
    play.catch(() => {
      if (!mutedRef.current) {
        video.muted = true;
        mutedRef.current = true;
        window.dispatchEvent(new CustomEvent("oriel-hero-sound-state", { detail: true }));
      }
    });
  }, [active, current?.playSrc]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLayers((stack) => (stack[stack.length - 1] === active ? [active] : stack));
    }, 760);
    return () => window.clearTimeout(timer);
  }, [active]);

  function choose(index: number) {
    if (!count) return;
    const next = (index + count) % count;
    if (next === active) return;
    setLayers((stack) => {
      const kept = stack.filter((item) => item !== next && item < count);
      kept.push(next);
      return kept.slice(-2);
    });
    setActive(next);
  }

  if (!count || !current) return null;

  return (
    <>
      {layers.map((index) => {
        const video = playable[index];
        if (!video) return null;
        const selected = index === active;
        return (
          <video
            key={video.playSrc}
            ref={selected ? activeRef : undefined}
            className={`absolute inset-0 h-full w-full object-cover ${selected ? "hero-stage-enter z-10" : "z-0"}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={video.poster || undefined}
          >
            <source src={video.playSrc} type="video/mp4" />
          </video>
        );
      })}

      <div className="absolute inset-x-0 bottom-5 z-30 flex flex-col items-center gap-3 px-4">
        {orderProduct ? <HeroOrderButton key={current.id} product={orderProduct} /> : null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => choose(active - 1)}
            aria-label="Previous video"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/55 text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div
            className="overflow-hidden py-3"
            style={{ width: `calc(${visible} * ${thumbRem}rem + ${visible - 1} * ${gapRem}rem)` }}
          >
            <ul
              className="hero-reel flex"
              style={{
                gap: `${gapRem}rem`,
                transform: `translateX(calc(${-start} * (${thumbRem}rem + ${gapRem}rem)))`,
              }}
            >
              {playable.map((video, index) => {
                const selected = index === active;
                const inView = index >= start && index < start + visible;
                return (
                  <li key={video.id} style={{ width: `${thumbRem}rem` }} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => choose(index)}
                      aria-label={`Play ${video.label}`}
                      aria-current={selected}
                      className={`hero-thumb relative block h-16 w-full overflow-hidden rounded-lg ring-1 ring-white/40 sm:h-20 ${
                        selected ? "hero-thumb-on ring-2 ring-white" : ""
                      }`}
                    >
                      {inView ? (
                        <video
                          className="h-full w-full object-cover"
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          poster={video.poster || undefined}
                          aria-hidden="true"
                        >
                          <source src={video.playSrc} type="video/mp4" />
                        </video>
                      ) : video.poster ? (
                        <img src={video.poster} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => choose(active + 1)}
            aria-label="Next video"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-black/55 text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
