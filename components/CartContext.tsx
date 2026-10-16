"use client";

import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { placeRemoteOrder } from "@/app/track/actions";
import { CardFields, emptyCard, type CardFieldsValue } from "@/components/CardFields";
import { PaymentSchedule } from "@/components/PaymentSchedule";
import { demoOrders } from "@/lib/demo-orders";
import { readCard, splitHalf } from "@/lib/payments";
import { formatMoney, shippingFor } from "@/lib/pricing";
import { readCart, readOrders, saveOrder, writeCart } from "@/lib/storage";
import type { CartItem, Order, Product } from "@/lib/types";

type CustomerDetails = {
  name: string;
  email: string;
  address: string;
  deposit_last4: string;
};

type PlaceOrderResult = {
  order: Order;
  synced: boolean;
  warning?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  placeOrder: (input: CustomerDetails) => Promise<PlaceOrderResult>;
};

const CartContext = createContext<CartContextValue | null>(null);

function createOrderId(): string {
  const taken = new Set(
    [...readOrders(), ...demoOrders].map((order) => order.id.toUpperCase()),
  );
  let id = "";
  do {
    id = `OR-${Math.floor(10000 + Math.random() * 90000)}`;
  } while (taken.has(id));
  return id;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeCart(items);
  }, [items, ready]);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  const addItem = useCallback((product: Product, quantity = 1) => {
    if (product.stock_quantity < 1) return;
    const amount = Math.max(1, quantity);
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (!existing) {
        return [
          ...current,
          {
            productId: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0],
            weight: product.weight,
            stock_quantity: product.stock_quantity,
            quantity: Math.min(product.stock_quantity, amount),
          },
        ];
      }
      return current.map((item) =>
        item.productId === product.id
          ? {
              ...item,
              stock_quantity: product.stock_quantity,
              quantity: Math.min(product.stock_quantity, item.quantity + amount),
            }
          : item,
      );
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) return [item];
        if (quantity < 1) return [];
        return [{ ...item, quantity: Math.min(item.stock_quantity, quantity) }];
      }),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const placeOrder = useCallback(
    async (input: CustomerDetails): Promise<PlaceOrderResult> => {
      const id = createOrderId();
      const email = input.email.trim().toLowerCase();
      const split = splitHalf(total);
      const payload = {
        id,
        customer_name: input.name.trim(),
        customer_email: email,
        shipping_address: input.address.trim(),
        deposit_last4: input.deposit_last4,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
      };

      const remote = await placeRemoteOrder(payload);
      if (remote.ok) {
        saveOrder(remote.order);
        setItems([]);
        return { order: remote.order, synced: true };
      }

      const localOrder: Order = {
        id,
        customer_name: payload.customer_name,
        customer_email: email,
        shipping_address: payload.shipping_address,
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
        items: items.map((item) => ({
          id: `${id}-${item.productId}`,
          order_id: id,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      };
      saveOrder(localOrder);
      setItems([]);
      return {
        order: localOrder,
        synced: false,
        warning:
          remote.reason === "error"
            ? "Saved on this device. The store database did not accept the order yet."
            : undefined,
      };
    },
    [items, total],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count,
      subtotal,
      shipping,
      total,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      setQuantity,
      removeItem,
      placeOrder,
    }),
    [
      items,
      count,
      subtotal,
      shipping,
      total,
      isOpen,
      addItem,
      setQuantity,
      removeItem,
      placeOrder,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}

function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    setQuantity,
    removeItem,
    subtotal,
    shipping,
    total,
    placeOrder,
  } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [card, setCard] = useState<CardFieldsValue>(emptyCard);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);

  useEffect(() => {
    const node = overlayRef.current;
    if (!node) return;
    if (isOpen) node.removeAttribute("inert");
    else node.setAttribute("inert", "");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  function dismiss() {
    setPlaced(null);
    setWarning(null);
    setError(null);
    closeCart();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("Enter the name for the parcel.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email. You will need it to track the order.");
      return;
    }
    if (address.trim().length < 8) {
      setError("Enter a full shipping address.");
      return;
    }
    const cardCheck = readCard(card);
    if (!cardCheck.ok) {
      setError(cardCheck.message);
      return;
    }
    setSubmitting(true);
    try {
      const result = await placeOrder({
        name,
        email,
        address,
        deposit_last4: cardCheck.last4,
      });
      setPlaced(result.order);
      setWarning(result.warning ?? null);
      setName("");
      setEmail("");
      setAddress("");
      setCard(emptyCard);
    } finally {
      setSubmitting(false);
    }
  }

  const split = splitHalf(total);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-ink/40 transition-opacity ${isOpen ? "opacity-100" : "opacity-0"}`}
        aria-label="Close cart"
        onClick={dismiss}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-elevated shadow-lift transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-title" className="font-serif text-2xl tracking-tight">
            Cart
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {placed ? (
          <div className="flex flex-1 flex-col justify-between px-5 py-6">
            <div>
              <p className="eyebrow">Deposit paid</p>
              <p className="mt-3 font-serif text-4xl tracking-tight">{placed.id}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {formatMoney(placed.deposit_amount)} was recorded on the card ending{" "}
                {placed.deposit_last4}. Keep this ID with {placed.customer_email}. The remaining{" "}
                {formatMoney(placed.balance_amount)} is paid on the tracking page after the shipment
                arrives.
              </p>
              <p className="nums mt-4 text-sm">Total {formatMoney(placed.total_price)}</p>
              {warning ? <p className="mt-3 text-sm text-signal">{warning}</p> : null}
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href={`/track?email=${encodeURIComponent(placed.customer_email)}&order=${encodeURIComponent(placed.id)}`}
                className="btn-primary"
                onClick={dismiss}
              >
                Track this order
              </Link>
              <button type="button" className="btn-secondary" onClick={dismiss}>
                Continue browsing
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center px-5">
            <p className="font-serif text-3xl tracking-tight">Your cart is empty.</p>
            <Link href="/gallery" className="btn-primary mt-6" onClick={closeCart}>
              Shop the edit
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-5 px-5 py-5">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-paper">
                    <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium leading-snug">{item.title}</p>
                      <p className="nums text-sm">{formatMoney(item.price * item.quantity)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted">{item.weight.toFixed(2)} kg each</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center"
                          aria-label={`Decrease ${item.title}`}
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="nums w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center"
                          aria-label={`Increase ${item.title}`}
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-xs text-muted underline-offset-4 hover:underline"
                        onClick={() => removeItem(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line px-5 py-5">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="nums">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Tracked shipping</dt>
                  <dd className="nums">{formatMoney(shipping)}</dd>
                </div>
                <div className="flex justify-between text-base font-medium">
                  <dt>Total</dt>
                  <dd className="nums">{formatMoney(total)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Flat {formatMoney(shipping)} toward tracked international line-haul. Duties, if any,
                are charged by customs.
              </p>
              <div className="mt-4 space-y-3">
                <label className="block text-xs text-muted" htmlFor="cart-name">
                  Name
                  <input
                    id="cart-name"
                    className="field mt-1"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label className="block text-xs text-muted" htmlFor="cart-email">
                  Email
                  <input
                    id="cart-email"
                    type="email"
                    className="field mt-1"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
                <label className="block text-xs text-muted" htmlFor="cart-address">
                  Shipping address
                  <textarea
                    id="cart-address"
                    className="field mt-1 min-h-20 resize-y"
                    autoComplete="street-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </label>
              </div>
              <div className="mt-4">
                <PaymentSchedule
                  deposit={split.deposit}
                  balance={split.balance}
                  depositPaid={false}
                  balancePaid={false}
                  balancePayable={false}
                />
              </div>
              <div className="mt-4">
                <CardFields value={card} onChange={setCard} idPrefix="cart-card" />
              </div>
              {error ? (
                <p role="alert" className="mt-3 text-sm text-signal">
                  {error}
                </p>
              ) : null}
              <button type="submit" className="btn-primary mt-4 w-full" disabled={submitting}>
                {submitting ? "Paying deposit…" : `Pay ${formatMoney(split.deposit)} deposit`}
              </button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Use 4242 4242 4242 4242, any future month, and any three-digit CVC. Only the last
                four digits are stored on the order.
              </p>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
