export type OrderStatus = "pending" | "processing" | "shipped" | "arrived";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  stock_quantity: number;
  ordered: number;
  weight: number;
  shipping_time_estimate: string;
  china_supplier_url: string;
  dimensions: string;
  origin: string;
  material: string;
  compare_at: number;
};

export type Review = {
  id: string;
  product_id: string;
  author: string;
  rating: number;
  body: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  total_price: number;
  status: OrderStatus;
  tracking_number: string | null;
  china_order_id: string | null;
  deposit_amount: number;
  balance_amount: number;
  deposit_paid: boolean;
  balance_paid: boolean;
  deposit_last4: string | null;
  balance_last4: string | null;
  items: OrderItem[];
};

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image: string;
  weight: number;
  stock_quantity: number;
  quantity: number;
};

export type PlaceOrderInput = {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  deposit_last4: string;
  items: { product_id: string; quantity: number }[];
};

export type RemoteResult<T> =
  | { ok: true; order: T }
  | { ok: false; reason: "unconfigured" | "not_found" | "error"; message?: string };
