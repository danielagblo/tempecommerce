import { splitHalf } from "@/lib/payments";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "arrived"];

function asNumber(value: unknown): number | null {
  const numberValue =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(numberValue) ? numberValue : null;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeOrder(raw: unknown): Order | null {
  if (!raw || typeof raw !== "object") return null;

  const value = raw as Record<string, unknown>;
  if (typeof value.id !== "string" || typeof value.customer_email !== "string") return null;
  if (!STATUSES.includes(value.status as OrderStatus)) return null;

  const total = asNumber(value.total_price);
  if (total === null) return null;
  const split = splitHalf(total);
  const deposit = asNumber(value.deposit_amount) ?? split.deposit;
  const balance = asNumber(value.balance_amount) ?? split.balance;

  const itemsRaw = Array.isArray(value.items) ? value.items : [];
  const items: OrderItem[] = [];

  for (const entry of itemsRaw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const quantity = asNumber(row.quantity);
    const price = asNumber(row.price);
    if (typeof row.id !== "string" || typeof row.product_id !== "string") continue;
    if (quantity === null || price === null) continue;
    items.push({
      id: row.id,
      order_id: typeof row.order_id === "string" ? row.order_id : value.id,
      product_id: row.product_id,
      quantity,
      price,
    });
  }

  return {
    id: value.id,
    customer_name: typeof value.customer_name === "string" ? value.customer_name : "",
    customer_email: value.customer_email,
    shipping_address: typeof value.shipping_address === "string" ? value.shipping_address : "",
    total_price: total,
    status: value.status as OrderStatus,
    tracking_number: asNullableString(value.tracking_number),
    china_order_id: asNullableString(value.china_order_id),
    deposit_amount: deposit,
    balance_amount: balance,
    deposit_paid: asBoolean(value.deposit_paid),
    balance_paid: asBoolean(value.balance_paid),
    deposit_last4: asNullableString(value.deposit_last4),
    balance_last4: asNullableString(value.balance_last4),
    items,
  };
}
