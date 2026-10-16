import { isAdmin } from "@/lib/server/auth";
import { readStore, updateStoredOrder } from "@/lib/server/store";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "arrived"];

export async function GET() {
  if (!isAdmin()) return Response.json({ error: "Sign in required." }, { status: 401 });
  const store = await readStore();
  return Response.json({ orders: store.orders });
}

export async function PATCH(request: Request) {
  if (!isAdmin()) return Response.json({ error: "Sign in required." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
    status?: unknown;
    tracking_number?: unknown;
    china_order_id?: unknown;
  } | null;
  if (!body || typeof body.id !== "string" || !STATUSES.includes(body.status as OrderStatus)) {
    return Response.json({ error: "That order update is not valid." }, { status: 400 });
  }
  const tracking = typeof body.tracking_number === "string" ? body.tracking_number.trim() : "";
  const china = typeof body.china_order_id === "string" ? body.china_order_id.trim() : "";
  const order = await updateStoredOrder(body.id, {
    status: body.status as OrderStatus,
    tracking_number: tracking || null,
    china_order_id: china || null,
  });
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ order });
}
