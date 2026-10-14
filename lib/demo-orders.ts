import type { Order } from "@/lib/types";

export const demoOrders: Order[] = [
  {
    id: "OR-10482",
    customer_name: "Ada Chen",
    customer_email: "ada@example.com",
    shipping_address: "18 Mercer Street, New York, NY 10013",
    total_price: 158,
    status: "shipped",
    tracking_number: "YT2531849201CN",
    china_order_id: "CN-88421",
    deposit_amount: 79,
    balance_amount: 79,
    deposit_paid: true,
    balance_paid: false,
    deposit_last4: "4242",
    balance_last4: null,
    items: [
      {
        id: "oi-10482-linen",
        order_id: "OR-10482",
        product_id: "linen-throw",
        quantity: 1,
        price: 58,
      },
      {
        id: "oi-10482-tote",
        order_id: "OR-10482",
        product_id: "woven-leather-tote",
        quantity: 1,
        price: 88,
      },
    ],
  },
  {
    id: "OR-10490",
    customer_name: "Ada Chen",
    customer_email: "ada@example.com",
    shipping_address: "90 Abbot Kinney Blvd, Venice, CA 90291",
    total_price: 140,
    status: "processing",
    tracking_number: null,
    china_order_id: "CN-88490",
    deposit_amount: 70,
    balance_amount: 70,
    deposit_paid: true,
    balance_paid: false,
    deposit_last4: "4242",
    balance_last4: null,
    items: [
      {
        id: "oi-10490-lamp",
        order_id: "OR-10490",
        product_id: "arc-floor-lamp",
        quantity: 1,
        price: 128,
      },
    ],
  },
  {
    id: "OR-10502",
    customer_name: "Ada Chen",
    customer_email: "ada@example.com",
    shipping_address: "14 Elm Row, Edinburgh EH7 4AA",
    total_price: 54,
    status: "pending",
    tracking_number: null,
    china_order_id: null,
    deposit_amount: 27,
    balance_amount: 27,
    deposit_paid: true,
    balance_paid: false,
    deposit_last4: "4242",
    balance_last4: null,
    items: [
      {
        id: "oi-10502-cups",
        order_id: "OR-10502",
        product_id: "studio-cups",
        quantity: 1,
        price: 42,
      },
    ],
  },
  {
    id: "OR-10611",
    customer_name: "Ada Chen",
    customer_email: "ada@example.com",
    shipping_address: "18 Mercer Street, New York, NY 10013",
    total_price: 70,
    status: "arrived",
    tracking_number: "YT2531904418CN",
    china_order_id: "CN-88611",
    deposit_amount: 35,
    balance_amount: 35,
    deposit_paid: true,
    balance_paid: false,
    deposit_last4: "4242",
    balance_last4: null,
    items: [
      {
        id: "oi-10611-linen",
        order_id: "OR-10611",
        product_id: "linen-throw",
        quantity: 1,
        price: 58,
      },
    ],
  },
];

export function findDemoOrder(email: string, orderId: string): Order | null {
  const emailKey = email.trim().toLowerCase();
  const idKey = orderId.trim().toLowerCase();
  return (
    demoOrders.find(
      (order) =>
        order.customer_email.toLowerCase() === emailKey && order.id.toLowerCase() === idKey,
    ) ?? null
  );
}
