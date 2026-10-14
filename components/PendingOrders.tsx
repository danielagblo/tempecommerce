"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { demoOrders } from "@/lib/demo-orders";
import { formatMoney } from "@/lib/pricing";
import { ORDERS_EVENT, readOrders } from "@/lib/storage";
import type { Order } from "@/lib/types";

function pendingFrom(stored: Order[]): Order[] {
  const byId = new Map<string, Order>();
  for (const order of demoOrders) byId.set(order.id.toUpperCase(), order);
  for (const order of stored) byId.set(order.id.toUpperCase(), order);
  return Array.from(byId.values())
    .filter((order) => order.status === "pending")
    .sort((a, b) => b.id.localeCompare(a.id));
}

export function PendingOrders() {
  const [orders, setOrders] = useState<Order[]>(() => pendingFrom([]));

  useEffect(() => {
    function load() {
      setOrders(pendingFrom(readOrders()));
    }
    load();
    window.addEventListener(ORDERS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(ORDERS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const shown = orders.slice(0, 5);
  const rest = orders.length - shown.length;

  return (
    <section className="border-b border-line">
      <Container className="py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Still with the workshop</p>
            <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Pending orders</h2>
          </div>
          <p className="nums text-sm text-muted">
            <span className="font-medium text-ink">{orders.length}</span> placed
          </p>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          These are paid deposits the workshop has not packed yet. The balance stays closed until
          the shipment arrives.
        </p>
        {shown.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No orders are waiting.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {shown.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/track?email=${encodeURIComponent(order.customer_email)}&order=${encodeURIComponent(order.id)}`}
                  className="flex items-center justify-between gap-4 py-3.5 hover:opacity-70"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{order.id}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {order.customer_name} · Pending
                    </span>
                  </span>
                  <span className="nums shrink-0 text-sm">{formatMoney(order.total_price)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {rest > 0 ? (
          <p className="mt-3 text-xs text-muted">
            {rest} more pending {rest === 1 ? "order is" : "orders are"} saved on this device.
          </p>
        ) : null}
      </Container>
    </section>
  );
}
