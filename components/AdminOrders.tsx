"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import type { Order, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "arrived"];

type Draft = {
  status: OrderStatus;
  tracking_number: string;
  china_order_id: string;
};

function draftFrom(order: Order): Draft {
  return {
    status: order.status,
    tracking_number: order.tracking_number ?? "",
    china_order_id: order.china_order_id ?? "",
  };
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!response.ok || cancelled) {
        if (!cancelled) setError("Orders could not be loaded.");
        return;
      }
      const body = (await response.json()) as { orders: Order[] };
      if (cancelled) return;
      setOrders(body.orders);
      setDrafts(Object.fromEntries(body.orders.map((order) => [order.id, draftFrom(order)])));
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  function setDraft(id: string, patch: Partial<Draft>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  async function save(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    setError("");
    setSavedId("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status: draft.status,
        tracking_number: draft.tracking_number,
        china_order_id: draft.china_order_id,
      }),
    });
    if (!response.ok) {
      setError("That order could not be saved.");
      return;
    }
    const body = (await response.json()) as { order: Order };
    setOrders((current) => current?.map((order) => (order.id === id ? body.order : order)) ?? null);
    setDrafts((current) => ({ ...current, [id]: draftFrom(body.order) }));
    setSavedId(id);
  }

  if (!orders) {
    return <p className="mt-6 text-sm text-muted">{error || "Loading orders."}</p>;
  }

  return (
    <div className="mt-6">
      <ul className="flex flex-col gap-4">
        {orders.map((order) => {
          const draft = drafts[order.id] ?? draftFrom(order);
          return (
            <li key={order.id} className="rounded-2xl border border-line p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{order.id}</p>
                <p className="nums text-sm">{formatMoney(order.total_price)}</p>
              </div>
              <p className="mt-1 text-sm text-muted">
                {order.customer_name} · {order.customer_email}
              </p>
              <p className="mt-1 text-sm">{order.shipping_address}</p>
              <p className="mt-2 text-sm text-muted">
                {order.items
                  .map((item) => {
                    const product = getProduct(item.product_id);
                    return `${product?.title ?? item.product_id} × ${item.quantity}`;
                  })
                  .join(", ")}
              </p>
              <p className="mt-1 text-xs text-muted">
                Deposit {order.deposit_paid ? "paid" : "due"}
                {order.deposit_last4 ? ` ···· ${order.deposit_last4}` : ""}
                <span className="px-1.5">·</span>
                Balance {order.balance_paid ? "paid" : "due"}
                {order.balance_last4 ? ` ···· ${order.balance_last4}` : ""}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <label className="text-xs text-muted">
                  Status
                  <select
                    className="field mt-1"
                    value={draft.status}
                    onChange={(event) => setDraft(order.id, { status: event.target.value as OrderStatus })}
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-muted">
                  Tracking number
                  <input
                    className="field mt-1"
                    value={draft.tracking_number}
                    onChange={(event) => setDraft(order.id, { tracking_number: event.target.value })}
                  />
                </label>
                <label className="text-xs text-muted">
                  China order id
                  <input
                    className="field mt-1"
                    value={draft.china_order_id}
                    onChange={(event) => setDraft(order.id, { china_order_id: event.target.value })}
                  />
                </label>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button type="button" className="btn-primary" onClick={() => void save(order.id)}>
                  Save order
                </button>
                {savedId === order.id ? <p className="text-sm text-muted">Saved.</p> : null}
              </div>
            </li>
          );
        })}
      </ul>
      {error ? <p className="mt-3 text-sm text-signal">{error}</p> : null}
    </div>
  );
}
