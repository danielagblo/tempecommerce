"use client";

import { useEffect, useState } from "react";
import { CountUp } from "@/components/CountUp";
import { lotFor } from "@/lib/demand";
import { ORDERS_EVENT, readOrders } from "@/lib/storage";
import type { Order, Product } from "@/lib/types";

export function useLot(product: Product): { ordered: number; left: number } {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    function load() {
      setOrders(readOrders());
    }
    load();
    window.addEventListener(ORDERS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(ORDERS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return lotFor(product, orders);
}

export function StockFigure({
  product,
  prominent = false,
}: {
  product: Product;
  prominent?: boolean;
}) {
  const { ordered, left } = useLot(product);

  if (prominent) {
    return (
      <p className="mt-4 text-sm text-muted">
        <CountUp value={ordered} className="nums font-serif text-3xl text-ink" /> ordered
        <span className="px-2 text-line">·</span>
        <CountUp value={left} start="current" className="nums text-ink" /> left in this lot
      </p>
    );
  }

  return (
    <p className="mt-1 text-xs text-muted">
      <CountUp value={ordered} className="nums text-ink" /> ordered
      <span className="px-1.5 text-line">·</span>
      <CountUp value={left} start="current" className="nums text-ink" /> left
    </p>
  );
}
