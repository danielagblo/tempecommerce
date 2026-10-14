export const SHIPPING_FLAT = 12;

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function shippingFor(subtotal: number): number {
  return subtotal > 0 ? SHIPPING_FLAT : 0;
}

export function savingsPercent(price: number, compareAt: number): number {
  if (compareAt <= 0) return 0;
  return Math.round((1 - price / compareAt) * 100);
}
