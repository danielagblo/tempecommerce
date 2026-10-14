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
}: {
  value: number;
  format?: Format;
  className?: string;
  start?: "zero" | "current";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fromRef = useRef(start === "current" ? value : 0);
  const holdFirst = useRef(start === "current");
  const [shown, setShown] = useState(start === "current" ? value : 0);
  const [active, setActive] = useState(false);

  useEffect(() => {
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
  }, []);

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
    const duration = Math.min(1600, Math.max(650, distance * 70));
    let frame = 0;
    const finish = window.setTimeout(() => {
      fromRef.current = value;
      setShown(value);
    }, duration + 80);
    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const eased = 1 - (1 - progress) ** 3;
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
  }, [active, value]);

  const step = format === "integer" ? Math.round(shown) : shown;

  return (
    <span ref={ref} className={className}>
      <span key={step} className="stock-tick">
        {renderValue(shown, format)}
      </span>
    </span>
  );
}
