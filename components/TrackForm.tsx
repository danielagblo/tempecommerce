"use client";

import { Check, Copy, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { lookupRemoteOrder, payRemoteBalance } from "@/app/track/actions";
import { CardFields, emptyCard, type CardFieldsValue } from "@/components/CardFields";
import { OrderTimeline } from "@/components/OrderTimeline";
import { PaymentSchedule } from "@/components/PaymentSchedule";
import { findDemoOrder } from "@/lib/demo-orders";
import { readCard } from "@/lib/payments";
import { formatMoney } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import { findStoredOrder, saveOrder } from "@/lib/storage";
import type { Order } from "@/lib/types";
import { useSearchParams } from "next/navigation";

type LookupSource = "database" | "device" | "sample";

const samples = [
  { id: "OR-10482", label: "Shipped" },
  { id: "OR-10490", label: "Processing" },
  { id: "OR-10502", label: "Pending" },
  { id: "OR-10611", label: "Arrived" },
];

export function TrackForm() {
  const params = useSearchParams();
  const didAuto = useRef(false);
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [orderId, setOrderId] = useState(params.get("order") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [source, setSource] = useState<LookupSource | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [card, setCard] = useState<CardFieldsValue>(emptyCard);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const runSearch = useCallback(async (emailValue: string, orderValue: string) => {
    const trimmedEmail = emailValue.trim();
    const trimmedOrder = orderValue.trim();
    setCopied(false);
    if (!trimmedEmail || !trimmedOrder) {
      setOrder(null);
      setSource(null);
      setWarning(null);
      setMessage("Enter both the email and the order ID.");
      return;
    }

    setLoading(true);
    setMessage(null);
    setWarning(null);
    setPayError(null);
    setCard(emptyCard);
    try {
      const remote = await lookupRemoteOrder(trimmedEmail, trimmedOrder);
      if (remote.ok) {
        setOrder(remote.order);
        setSource("database");
        return;
      }
      if (remote.reason === "error") {
        setWarning("The store database could not be reached. Showing a local match if there is one.");
      }
      const stored = findStoredOrder(trimmedEmail, trimmedOrder);
      if (stored) {
        setOrder(stored);
        setSource("device");
        return;
      }
      const sample = findDemoOrder(trimmedEmail, trimmedOrder);
      if (sample) {
        setOrder(sample);
        setSource("sample");
        return;
      }
      setOrder(null);
      setSource(null);
      setMessage("No order matches that email and order ID.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (didAuto.current) return;
    const emailValue = params.get("email");
    const orderValue = params.get("order");
    if (!emailValue || !orderValue) return;
    didAuto.current = true;
    void runSearch(emailValue, orderValue);
  }, [params, runSearch]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(email, orderId);
  }

  async function copyTracking(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const itemsTotal = order?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) ?? 0;
  const shipping = order ? order.total_price - itemsTotal : 0;

  return (
    <div className="mt-10">
      <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block text-xs text-muted">
          Email
          <input
            className="field mt-1"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ada@example.com"
          />
        </label>
        <label className="block text-xs text-muted">
          Order ID
          <input
            className="field mt-1"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="OR-10482"
          />
        </label>
        <button type="submit" className="btn-primary mt-5 h-12 sm:mt-[1.35rem]" disabled={loading}>
          <Search className="h-4 w-4" />
          {loading ? "Searching" : "Search"}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>Sample records for ada@example.com</span>
        {samples.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="rounded-full border border-line px-3 py-1 hover:bg-ink/5"
            onClick={() => {
              setEmail("ada@example.com");
              setOrderId(sample.id);
              void runSearch("ada@example.com", sample.id);
            }}
          >
            {sample.label} · {sample.id}
          </button>
        ))}
      </div>

      {message ? <p className="mt-8 text-sm text-muted">{message}</p> : null}
      {warning ? <p className="mt-8 text-sm text-signal">{warning}</p> : null}

      {order ? (
        <article className="mt-8 rounded-[28px] border border-line bg-elevated p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">
                {source === "database"
                  ? "Store database"
                  : source === "device"
                    ? "Saved on this device"
                    : "Sample record"}
              </p>
              <h2 className="mt-2 font-serif text-4xl tracking-tight">{order.id}</h2>
            </div>
            <p className="text-sm text-muted">{order.customer_name}</p>
          </div>

          <OrderTimeline status={order.status} />

          <div className="mt-6 rounded-2xl border border-line bg-paper p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">International tracking</p>
            {order.tracking_number ? (
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="font-mono text-sm sm:text-base">{order.tracking_number}</p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
                  onClick={() => copyTracking(order.tracking_number as string)}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {order.status === "shipped" || order.status === "arrived"
                  ? "Marked shipped, but no tracking number is on the order yet."
                  : "The tracking number is issued when the carrier scans the parcel. Nothing is shown here before that."}
              </p>
            )}
          </div>

          <p className="mt-4 text-sm text-muted">
            {order.china_order_id
              ? `Supplier reference ${order.china_order_id}`
              : "The supplier reference appears once the workshop accepts the order."}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{order.shipping_address}</p>

          {order.items.length > 0 ? (
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                  <span>
                    {getProduct(item.product_id)?.title ?? item.product_id}
                    <span className="text-muted"> × {item.quantity}</span>
                  </span>
                  <span className="nums">{formatMoney(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <dl className="mt-4 space-y-2 text-sm">
            {order.items.length > 0 ? (
              <>
                <div className="flex justify-between text-muted">
                  <dt>Goods</dt>
                  <dd className="nums">{formatMoney(itemsTotal)}</dd>
                </div>
                <div className="flex justify-between text-muted">
                  <dt>Tracked shipping</dt>
                  <dd className="nums">{formatMoney(shipping)}</dd>
                </div>
              </>
            ) : null}
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd className="nums">{formatMoney(order.total_price)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <PaymentSchedule
              deposit={order.deposit_amount}
              balance={order.balance_amount}
              depositPaid={order.deposit_paid}
              balancePaid={order.balance_paid}
              balancePayable={order.status === "arrived" && order.deposit_paid && !order.balance_paid}
            />
          </div>

          {order.status === "arrived" && order.deposit_paid && !order.balance_paid ? (
            <form
              className="mt-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setPayError(null);
                const cardCheck = readCard(card);
                if (!cardCheck.ok) {
                  setPayError(cardCheck.message);
                  return;
                }
                setPaying(true);
                try {
                  const remote = await payRemoteBalance(
                    order.customer_email,
                    order.id,
                    cardCheck.last4,
                  );
                  if (remote.ok) {
                    saveOrder(remote.order);
                    setOrder(remote.order);
                    setSource("database");
                    setCard(emptyCard);
                    return;
                  }
                  if (remote.reason === "error") {
                    setPayError(remote.message ?? "The balance could not be recorded.");
                    return;
                  }
                  const paid: Order = {
                    ...order,
                    balance_paid: true,
                    balance_last4: cardCheck.last4,
                  };
                  saveOrder(paid);
                  setOrder(paid);
                  setSource("device");
                  setCard(emptyCard);
                } finally {
                  setPaying(false);
                }
              }}
            >
              <CardFields value={card} onChange={setCard} idPrefix="balance-card" />
              {payError ? (
                <p role="alert" className="mt-3 text-sm text-signal">
                  {payError}
                </p>
              ) : null}
              <button type="submit" className="btn-primary mt-4 w-full" disabled={paying}>
                {paying ? "Paying balance…" : `Pay ${formatMoney(order.balance_amount)} balance`}
              </button>
            </form>
          ) : null}
        </article>
      ) : null}
    </div>
  );
}
