import { normalizeOrder } from "@/lib/normalize";
import type { CartItem, Order } from "@/lib/types";

const CART_KEY = "oriel-cart";
const ORDERS_KEY = "oriel-orders";
export const ORDERS_EVENT = "oriel-orders";

function readJson(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.productId === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    typeof item.image === "string" &&
    typeof item.weight === "number" &&
    typeof item.stock_quantity === "number" &&
    typeof item.quantity === "number"
  );
}

export function readCart(): CartItem[] {
  const parsed = readJson(CART_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isCartItem);
}

export function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function readOrders(): Order[] {
  const parsed = readJson(ORDERS_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((order) => {
    const normalized = normalizeOrder(order);
    return normalized ? [normalized] : [];
  });
}

export function saveOrder(order: Order): void {
  if (typeof window === "undefined") return;
  const next = [order, ...readOrders().filter((existing) => existing.id !== order.id)];
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(ORDERS_EVENT));
}

export function findStoredOrder(email: string, orderId: string): Order | null {
  const emailKey = email.trim().toLowerCase();
  const idKey = orderId.trim().toLowerCase();
  return (
    readOrders().find(
      (order) =>
        order.customer_email.toLowerCase() === emailKey && order.id.toLowerCase() === idKey,
    ) ?? null
  );
}
