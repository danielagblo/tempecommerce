"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { videoTestimonials } from "@/lib/testimonials";

export function VideoTestimonials({ productId }: { productId: string }) {
  const items = videoTestimonials(productId);
  const [active, setActive] = useState(() => Math.max(0, items.length - 1));
  const [visible, setVisible] = useState(3);
  const count = items.length;
  const maxStart = Math.max(0, count - visible);
  const start = Math.min(maxStart, Math.max(0, active - Math.floor(visible / 2)));
  const thumbRem = visible > 2 ? 18 : 11;
  const gapRem = 0.5;
  const current = items[active];

  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)");
    const apply = () => setVisible(query.matches ? 3 : 2);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setActive((currentIndex) => (currentIndex >= count ? 0 : currentIndex));
  }, [count]);

  if (!count || !current) return null;

  function choose(index: number) {
    setActive((index + count) % count);
  }

  return (
    <section className="mt-20 sm:mt-28" aria-label="Video testimonies">
      <div className="text-center">
        <p className="eyebrow">From buyers</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Video testimonies</h2>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => choose(active - 1)}
            aria-label="Previous video"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper"
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
              {items.map((item, index) => {
                const selected = index === active;
                const inView = index >= start && index < start + visible;
                return (
                  <li key={item.id} style={{ width: `${thumbRem}rem` }} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => choose(index)}
                      aria-label={`Play testimony ${index + 1}`}
                      aria-current={selected}
                      className={`hero-thumb relative block h-28 w-full overflow-hidden rounded-lg ring-1 ring-line sm:h-40 ${
                        selected ? "hero-thumb-on ring-2 ring-ink" : ""
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
                          poster={item.poster}
                          aria-hidden="true"
                        >
                          <source src={item.src} type="video/mp4" />
                        </video>
                      ) : (
                        <img src={item.poster} alt="" className="h-full w-full object-cover" />
                      )}
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
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </section>
  );
}
