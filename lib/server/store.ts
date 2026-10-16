import { promises as fs } from "fs";
import path from "path";
import { demoOrders } from "@/lib/demo-orders";
import { defaultHeroFilms, sanitizeHeroFilms, type HeroFilm } from "@/lib/hero";
import { normalizeOrder } from "@/lib/normalize";
import { splitHalf } from "@/lib/payments";
import { SHIPPING_FLAT } from "@/lib/pricing";
import { getProduct } from "@/lib/products";
import type { Order, OrderStatus, PlaceOrderInput } from "@/lib/types";

type StoreData = {
  orders: Order[];
  films: HeroFilm[];
};

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "arrived"];
const filePath = path.join(process.cwd(), "data", "store.json");

let chain: Promise<void> = Promise.resolve();

function seed(): StoreData {
  return {
    orders: demoOrders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({ ...item })),
    })),
    films: defaultHeroFilms(),
  };
}

async function readFile(): Promise<StoreData> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as { orders?: unknown; films?: unknown };
    const orders = Array.isArray(parsed.orders)
      ? parsed.orders.flatMap((entry) => {
          const order = normalizeOrder(entry);
          return order ? [order] : [];
        })
      : [];
    const films = sanitizeHeroFilms(parsed.films);
    if (!orders.length && !films.length) return seed();
    return {
      orders,
      films: films.length ? films : defaultHeroFilms(),
    };
  } catch {
    const next = seed();
    await writeFile(next);
    return next;
  }
}

async function writeFile(data: StoreData): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = chain.then(task, task);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function readStore(): Promise<StoreData> {
  return enqueue(() => readFile());
}

export function updateStore<T>(mutator: (data: StoreData) => T): Promise<T> {
  return enqueue(async () => {
    const data = await readFile();
    const result = mutator(data);
    await writeFile(data);
    return result;
  });
}

export function lookupStoredOrder(email: string, orderId: string): Promise<Order | null> {
  const emailKey = email.trim().toLowerCase();
  const idKey = orderId.trim().toLowerCase();
  return enqueue(async () => {
    const data = await readFile();
    return (
      data.orders.find(
        (order) =>
          order.customer_email.toLowerCase() === emailKey && order.id.toLowerCase() === idKey,
      ) ?? null
    );
  });
}

export function placeStoredOrder(input: PlaceOrderInput): Promise<Order> {
  return updateStore((data) => {
    const id = input.id.trim();
    if (id.length < 4) throw new Error("Invalid order id");
    if (!/^[0-9]{4}$/.test(input.deposit_last4)) throw new Error("Deposit payment is required");
    if (input.customer_name.trim().length < 2) throw new Error("Invalid name");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.customer_email.trim())) {
      throw new Error("Invalid email");
    }
    if (input.shipping_address.trim().length < 8) throw new Error("Invalid address");
    if (!input.items.length) throw new Error("Order has no items");
    if (data.orders.some((order) => order.id.toLowerCase() === id.toLowerCase())) {
      throw new Error("That order id is already used");
    }

    let subtotal = 0;
    const items = input.items.map((line) => {
      const product = getProduct(line.product_id);
      if (!product) throw new Error("Unknown product");
      if (!Number.isInteger(line.quantity) || line.quantity < 1) throw new Error("Invalid quantity");
      subtotal += product.price * line.quantity;
      return {
        id: `${id}-${product.id}`,
        order_id: id,
        product_id: product.id,
        quantity: line.quantity,
        price: product.price,
      };
    });

    const total = subtotal + SHIPPING_FLAT;
    const split = splitHalf(total);
    const order: Order = {
      id,
      customer_name: input.customer_name.trim(),
      customer_email: input.customer_email.trim().toLowerCase(),
      shipping_address: input.shipping_address.trim(),
      total_price: total,
      status: "pending",
      tracking_number: null,
      china_order_id: null,
      deposit_amount: split.deposit,
      balance_amount: split.balance,
      deposit_paid: true,
      balance_paid: false,
      deposit_last4: input.deposit_last4,
      balance_last4: null,
      items,
    };
    data.orders = [order, ...data.orders];
    return order;
  });
}

export function payStoredBalance(email: string, orderId: string, last4: string): Promise<Order> {
  return updateStore((data) => {
    if (!/^[0-9]{4}$/.test(last4)) throw new Error("Enter the last four digits");
    const order = data.orders.find(
      (entry) =>
        entry.id.toLowerCase() === orderId.trim().toLowerCase() &&
        entry.customer_email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!order) throw new Error("Order not found");
    if (order.status !== "arrived") throw new Error("The balance is due after the shipment arrives");
    if (!order.deposit_paid) throw new Error("The deposit has not been paid");
    if (order.balance_paid) throw new Error("The balance is already paid");
    order.balance_paid = true;
    order.balance_last4 = last4;
    return order;
  });
}

export function updateStoredOrder(
  id: string,
  patch: { status: OrderStatus; tracking_number: string | null; china_order_id: string | null },
): Promise<Order | null> {
  if (!STATUSES.includes(patch.status)) throw new Error("Invalid status");
  return updateStore((data) => {
    const order = data.orders.find((entry) => entry.id === id);
    if (!order) return null;
    order.status = patch.status;
    order.tracking_number = patch.tracking_number;
    order.china_order_id = patch.china_order_id;
    return order;
  });
}

export function saveStoredFilms(films: HeroFilm[]): Promise<HeroFilm[]> {
  return updateStore((data) => {
    data.films = films;
    return films;
  });
}
