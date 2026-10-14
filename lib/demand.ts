import { demoOrders } from "@/lib/demo-orders";
import type { Order, Product } from "@/lib/types";

const demoIds = new Set(demoOrders.map((order) => order.id.toUpperCase()));

export function unitsFromOrders(productId: string, orders: Order[]): number {
  return orders.reduce((sum, order) => {
    if (demoIds.has(order.id.toUpperCase())) return sum;
    return (
      sum +
      order.items.reduce(
        (itemSum, item) => (item.product_id === productId ? itemSum + item.quantity : itemSum),
        0,
      )
    );
  }, 0);
}

export function lotFor(product: Product, orders: Order[]): { ordered: number; left: number } {
  const extra = unitsFromOrders(product.id, orders);
  return {
    ordered: product.ordered + extra,
    left: Math.max(0, product.stock_quantity - extra),
  };
}
