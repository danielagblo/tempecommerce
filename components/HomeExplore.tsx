"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import { Container } from "@/components/Container";
import { demoOrders } from "@/lib/demo-orders";
import { formatMoney } from "@/lib/pricing";
import { seedReviews } from "@/lib/reviews";
import { ORDERS_EVENT, readOrders } from "@/lib/storage";
import type { Order, Product } from "@/lib/types";

const demoIds = new Set(demoOrders.map((order) => order.id.toUpperCase()));

function cityOf(origin: string): string {
  return origin.split(",")[0]?.trim() || origin;
}

type LiveLine = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
};

function linesFor(products: Product[], stored: Order[]): LiveLine[] {
  const lines: LiveLine[] = [];
  const seen = new Set<string>();
  const add = (id: string, fullName: string, productId: string, quantity: number) => {
    const name = fullName.trim();
    const person = `${productId}:${name.toLowerCase()}`;
    if (!name || quantity < 1 || seen.has(person) || !products.some((item) => item.id === productId)) return;
    seen.add(person);
    lines.push({ id, productId, name, quantity });
  };

  for (const review of seedReviews) add(review.id, review.author, review.product_id, 1);
  for (const order of demoOrders) {
    for (const item of order.items) {
      add(`${order.id}-${item.product_id}`, order.customer_name, item.product_id, item.quantity);
    }
  }
  for (const order of stored) {
    if (demoIds.has(order.id.toUpperCase())) continue;
    for (const item of order.items) {
      const name = order.customer_name.trim();
      if (!name || item.quantity < 1 || !products.some((product) => product.id === item.product_id)) continue;
      lines.push({
        id: `${order.id}-${item.id}`,
        productId: item.product_id,
        name,
        quantity: item.quantity,
      });
    }
  }
  return lines;
}

type ReelClock = { start: number; shift: number };

function tally(lines: LiveLine[], clock: ReelClock | undefined): number {
  if (!clock) return 0;
  const revealed = Math.min(Math.max(clock.shift, 0), Math.max(0, lines.length - clock.start));
  return lines.slice(0, clock.start + revealed).reduce((sum, line) => sum + line.quantity, 0);
}

export function HomeExplore({ products }: { products: Product[] }) {
  const cities = Array.from(new Set(products.map((product) => cityOf(product.origin))));
  const [city, setCity] = useState<string>("All");
  const [stored, setStored] = useState<Order[]>([]);
  const [clocks, setClocks] = useState<Record<string, ReelClock>>({});
  const shown =
    city === "All" ? products : products.filter((product) => cityOf(product.origin) === city);
  const shots = shown.flatMap((product) =>
    product.images.map((src, index) => ({ src, index, product })),
  );
  const lines = linesFor(shown, stored);

  useEffect(() => {
    function load() {
      setStored(readOrders());
    }
    load();
    window.addEventListener(ORDERS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(ORDERS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return (
    <section id="gallery" className="scroll-mt-28">
      <Container className="pt-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...cities].map((name) => {
            const on = name === city;
            return (
              <button
                key={name}
                type="button"
                onClick={() => setCity(name)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
                  on ? "bg-ink text-paper" : "text-muted hover:text-ink"
                }`}
                aria-pressed={on}
              >
                {name}
              </button>
            );
          })}
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {shots.map((shot) => {
            const productLines = lines.filter((line) => line.productId === shot.product.id);
            return (
              <li key={`${shot.product.id}-${shot.index}`}>
                <Link href={`/product/${shot.product.id}`} className="group block">
                  <span className="relative block aspect-square overflow-hidden rounded-2xl bg-elevated">
                    <Image
                      src={shot.src}
                      alt={`${shot.product.title}, photo ${shot.index + 1}`}
                      fill
                      priority={shot.index === 0}
                      sizes="(min-width: 640px) 30vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                    <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 grid h-12 w-12 place-items-center rounded-full bg-black/75 text-white shadow-[0_8px_20px_rgb(0_0_0/0.28)]">
                      <span className="inline-flex items-center leading-none">
                        <span className="text-xs font-medium text-white/80">+</span>
                        <CountUp
                          value={tally(productLines, clocks[shot.product.id])}
                          duration={420}
                          play="immediate"
                          className="text-sm font-semibold leading-none"
                        />
                      </span>
                    </span>
                    <PhotoComments
                      lines={productLines}
                      lead={shot.index === 0}
                      clock={clocks[shot.product.id]}
                      onClock={(next) =>
                        setClocks((current) => {
                          const previous = current[shot.product.id];
                          if (previous && previous.start === next.start && previous.shift === next.shift) {
                            return current;
                          }
                          return { ...current, [shot.product.id]: next };
                        })
                      }
                    />
                  </span>
                  <span className="mt-2 block text-sm">{shot.product.title}</span>
                  <span className="mt-0.5 flex items-baseline justify-between gap-2 text-xs text-muted">
                    <span>{cityOf(shot.product.origin)}</span>
                    <span className="nums">{formatMoney(shot.product.price)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

function OrderChip({ line }: { line: LiveLine }) {
  return (
    <span className="inline-flex max-w-full items-baseline gap-1.5 whitespace-nowrap rounded-full bg-black/75 px-2.5 py-1 text-[12px] leading-none text-white shadow-[0_4px_14px_rgb(0_0_0/0.28)] sm:text-[13px]">
      <span className="font-semibold">{line.name}</span>
      <span className="font-normal text-white/80">{line.quantity} ordered</span>
    </span>
  );
}

const STRIDE = 32;
const VISIBLE = 3;

function PhotoComments({
  lines,
  lead,
  clock,
  onClock,
}: {
  lines: LiveLine[];
  lead: boolean;
  clock?: ReelClock;
  onClock: (clock: ReelClock) => void;
}) {
  const [start, setStart] = useState(0);
  const [shift, setShift] = useState(0);
  const [ready, setReady] = useState(false);
  const lengthRef = useRef(lines.length);
  const laneRef = useRef<HTMLSpanElement>(null);
  const onClockRef = useRef(onClock);
  onClockRef.current = onClock;
  const view = lead ? { start, shift } : clock ?? { start: 0, shift: 0 };
  const pass = lines.slice(view.start);
  const done = view.shift > pass.length + VISIBLE;

  useEffect(() => {
    if (!lead) return;
    onClockRef.current({ start, shift });
  }, [lead, start, shift]);

  useEffect(() => {
    if (!lead) return;
    const node = laneRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setReady(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lead, start, pass.length]);

  useEffect(() => {
    if (!lead) return;
    const previous = lengthRef.current;
    lengthRef.current = lines.length;
    if (lines.length <= previous) return;
    const newest = lines.length - 1;
    if (start + shift > newest) {
      setStart(newest);
      setShift(0);
    }
  }, [lead, lines.length, start, shift]);

  useEffect(() => {
    if (!lead || !ready || !pass.length || done) return;
    const allIn = shift >= pass.length;
    let wait = 880;
    if (shift === 0) wait = 200;
    else if (!allIn) wait = 700;
    else if (shift === pass.length) wait = 1200;
    const timer = window.setTimeout(() => setShift((value) => value + 1), wait);
    return () => window.clearTimeout(timer);
  }, [lead, ready, shift, done, pass.length]);

  if (!pass.length || done) return null;

  return (
    <span
      ref={laneRef}
      className="pointer-events-none absolute inset-x-2 bottom-2 z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,#000_14%,#000_100%)]"
      style={{ height: STRIDE * VISIBLE }}
    >
      <span
        className="live-track flex flex-col"
        style={{ transform: `translateY(${(VISIBLE - view.shift) * STRIDE}px)` }}
      >
        {pass.map((line) => (
          <span key={line.id} className="flex h-8 shrink-0 items-center">
            <OrderChip line={line} />
          </span>
        ))}
      </span>
    </span>
  );
}
