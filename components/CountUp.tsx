"use client";

import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/pricing";

type Format = "money" | "integer";

function renderValue(value: number, format: Format): string {
  if (format === "money") return formatMoney(Math.round(value * 100) / 100);
  return String(Math.round(value));
}

export function CountUp({
  value,
  format = "integer",
  className,
  start = "zero",
  duration: durationMs,
  play = "visible",
}: {
  value: number;
  format?: Format;
  className?: string;
  start?: "zero" | "current";
  duration?: number;
  play?: "visible" | "immediate";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(start === "current" ? value : 0);
  const holdFirst = useRef(start === "current");
  const [shown, setShown] = useState(start === "current" ? value : 0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (play === "immediate") {
      setActive(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [play]);

  useEffect(() => {
    if (!active) return;
    if (holdFirst.current) {
      holdFirst.current = false;
      fromRef.current = value;
      setShown(value);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      fromRef.current = value;
      setShown(value);
      return;
    }

    const from = fromRef.current;
    const began = performance.now();
    const distance = Math.abs(value - from);
    const duration = durationMs ?? Math.min(7000, Math.max(800, distance * 260));
    let frame = 0;
    const finish = window.setTimeout(() => {
      fromRef.current = value;
      setShown(value);
    }, duration + 80);
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = progress;
      const next = from + (value - from) * eased;
      fromRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(finish);
    };
  }, [active, value, durationMs]);

  const rounded = Math.max(0, Math.round(shown));

  return (
    <span ref={ref} className={className} aria-label={format === "integer" ? String(rounded) : undefined}>
      {format === "integer" ? (
        <>
          <span className="sr-only">{rounded}</span>
          <DigitRoll value={rounded} />
        </>
      ) : (
        renderValue(shown, format)
      )}
    </span>
  );
}

function DigitRoll({ value }: { value: number }) {
  const digits = String(value).split("");
  return (
    <span className="order-reels">
      {digits.map((digit, index) => (
        <Reel key={digits.length - index} digit={Number(digit)} />
      ))}
    </span>
  );
}

function Reel({ digit }: { digit: number }) {
  const spin = useRef(digit);
  const prev = useRef(digit);
  if (prev.current !== digit) {
    spin.current += (digit - prev.current + 10) % 10;
    prev.current = digit;
  }

  const cells = Math.max(10, spin.current + 1);

  return (
    <span className="order-reel" aria-hidden="true">
      <span
        className="order-reel-strip"
        style={{ transform: `translateY(-${spin.current}em)` }}
      >
        {Array.from({ length: cells }, (_, index) => (
          <span key={index} className="order-reel-digit">
            {index % 10}
          </span>
        ))}
      </span>
    </span>
  );
}
