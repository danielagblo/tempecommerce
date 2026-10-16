"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { demoOrders } from "@/lib/demo-orders";
import { formatMoney } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import { ORDERS_EVENT, readOrders } from "@/lib/storage";
import type { Order, OrderStatus } from "@/lib/types";

const steps: { id: OrderStatus; label: string }[] = [
  { id: "pending", label: "Wait" },
  { id: "processing", label: "Pack" },
  { id: "shipped", label: "Ship" },
  { id: "arrived", label: "Here" },
];

const statusLabel: Record<OrderStatus, string> = {
  pending: "Waiting",
  processing: "Packing",
  shipped: "On the way",
  arrived: "Arrived",
};

function placeOf(address: string): string {
  const parts = address.split(",").map((part) => part.trim());
  if (parts.length >= 3) {
    const region = parts[2].replace(/[\d-].*$/, "").trim();
    return region ? `${parts[1]}, ${region}` : parts[1];
  }
  return parts[1]?.replace(/\s+[A-Z]{1,2}\d[\w\s]*$/i, "").trim() || parts[0] || "";
}

function nextStep(order: Order): string {
  if (order.status === "pending") {
    return "Deposit is in. The workshop has not packed it, so there is no tracking number yet.";
  }
  if (order.status === "processing") {
    return "Being packed in China. Tracking shows up when the carrier scans the box.";
  }
  if (order.status === "shipped") {
    return "On the way. Pay the rest only after it arrives.";
  }
  if (order.balance_paid) return "It is here, and both halves are paid.";
  return "It is here. Pay the other half on this order.";
}

function actionLabel(order: Order): string {
  if (order.status === "arrived" && !order.balance_paid) return "Pay the rest";
  if (order.tracking_number) return "Follow it";
  return "Open it";
}

function rank(order: Order): number {
  if (order.status === "arrived" && !order.balance_paid) return 0;
  if (order.status === "shipped") return 1;
  if (order.status === "processing") return 2;
  if (order.status === "pending") return 3;
  return 4;
}

function mergeOrders(stored: Order[]): Order[] {
  const byId = new Map<string, Order>();
  for (const order of demoOrders) byId.set(order.id.toUpperCase(), order);
  for (const order of stored) byId.set(order.id.toUpperCase(), order);
  return Array.from(byId.values()).sort((a, b) => rank(a) - rank(b) || b.id.localeCompare(a.id));
}

function CopyTracking({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <p className="mt-4 flex items-center justify-between gap-3 text-sm">
      <span className="min-w-0">
        <span className="block text-xs text-muted">Tracking</span>
        <span className="nums mt-0.5 block truncate">{value}</span>
      </span>
      <button type="button" className="btn-secondary shrink-0 px-3 py-2" onClick={() => void copy()}>
        {copied ? "Copied" : "Copy"}
      </button>
    </p>
  );
}

export function OrderBoard() {
  const [orders, setOrders] = useState<Order[]>(() => mergeOrders([]));
  const [step, setStep] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    function load() {
      setOrders(mergeOrders(readOrders()));
    }
    load();
    window.addEventListener(ORDERS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(ORDERS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const shown = step === "all" ? orders : orders.filter((order) => order.status === step);
  const counts = steps.map((item) => ({
    ...item,
    count: orders.filter((order) => order.status === item.id).length,
  }));

  return (
    <div className="mt-8">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip on={step === "all"} onClick={() => setStep("all")}>
          All {orders.length}
        </FilterChip>
        {counts.map((item) => (
          <FilterChip key={item.id} on={step === item.id} onClick={() => setStep(item.id)}>
            {statusLabel[item.id]} {item.count}
          </FilterChip>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 text-sm text-muted">Nothing in this step.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {shown.map((order) => {
            const pieces = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const shipping = Math.max(0, Math.round((order.total_price - pieces) * 100) / 100);
            const active = steps.findIndex((item) => item.id === order.status);
            const href = `/track?email=${encodeURIComponent(order.customer_email)}&order=${encodeURIComponent(order.id)}`;
            const payNow = order.status === "arrived" && order.deposit_paid && !order.balance_paid;
            return (
              <li key={order.id} className="rounded-[24px] border border-line p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-signal">{statusLabel[order.status]}</p>
                    <h2 className="mt-1 font-serif text-3xl tracking-tight">{order.id}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {order.customer_name.split(" ")[0]} · {placeOf(order.shipping_address)}
                    </p>
                  </div>
                  <p className="nums text-sm">{formatMoney(order.total_price)}</p>
                </div>

                <ol className="mt-4 grid grid-cols-4 gap-2" aria-label="Order progress">
                  {steps.map((item, index) => (
                    <li key={item.id}>
                      <span
                        className={`block h-1 rounded-full ${index <= active ? "bg-ink" : "bg-line"}`}
                      />
                      <span
                        className={`mt-1 block text-[11px] ${index === active ? "text-ink" : "text-muted"}`}
                      >
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ol>

                <p className="mt-4 text-sm leading-relaxed">{nextStep(order)}</p>

                <ul className="mt-4 space-y-3">
                  {order.items.map((item) => {
                    const product = getProduct(item.product_id);
                    return (
                      <li key={item.id}>
                        <Link
                          href={product ? `/product/${product.id}` : "/"}
                          className="flex items-center gap-3"
                        >
                          <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-elevated">
                            {product ? (
                              <Image
                                src={product.images[0]}
                                alt=""
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm">{product?.title ?? item.product_id}</span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {product?.origin ?? "Workshop"}
                              {item.quantity > 1 ? ` · × ${item.quantity}` : ""}
                              {product ? ` · ${product.shipping_time_estimate}` : ""}
                            </span>
                          </span>
                          <span className="nums text-sm">{formatMoney(item.price * item.quantity)}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted">Paid</dt>
                    <dd className="nums mt-1">{formatMoney(order.deposit_amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">{payNow ? "Due now" : order.balance_paid ? "Rest" : "Later"}</dt>
                    <dd className="nums mt-1">{order.balance_paid ? "Paid" : formatMoney(order.balance_amount)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Shipping</dt>
                    <dd className="nums mt-1">{formatMoney(shipping)}</dd>
                  </div>
                </dl>

                {order.tracking_number ? (
                  <CopyTracking value={order.tracking_number} />
                ) : (
                  <p className="mt-4 text-sm text-muted">No tracking yet. It shows up when the box is scanned.</p>
                )}
                {order.china_order_id ? (
                  <p className="mt-2 text-xs text-muted">Workshop {order.china_order_id}</p>
                ) : null}

                <Link href={href} className={`mt-4 w-full ${payNow ? "btn-primary" : "btn-secondary"}`}>
                  {actionLabel(order)}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm ${
        on ? "bg-ink text-paper" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
