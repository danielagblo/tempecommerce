"use server";

import { normalizeOrder } from "@/lib/normalize";
import { lookupStoredOrder, payStoredBalance, placeStoredOrder } from "@/lib/server/store";
import { supabase } from "@/lib/supabase";
import type { Order, PlaceOrderInput, RemoteResult } from "@/lib/types";

export async function lookupRemoteOrder(
  email: string,
  orderId: string,
): Promise<RemoteResult<Order>> {
  if (!supabase) {
    const order = await lookupStoredOrder(email, orderId);
    return order ? { ok: true, order } : { ok: false, reason: "not_found" };
  }

  const { data, error } = await supabase.rpc("lookup_order", {
    p_email: email.trim(),
    p_order_id: orderId.trim(),
  });

  if (error) return { ok: false, reason: "error", message: error.message };
  if (!data) return { ok: false, reason: "not_found" };

  const order = normalizeOrder(data);
  if (!order) return { ok: false, reason: "error", message: "Unexpected order payload." };
  return { ok: true, order };
}

export async function placeRemoteOrder(input: PlaceOrderInput): Promise<RemoteResult<Order>> {
  if (!supabase) {
    try {
      const order = await placeStoredOrder(input);
      return { ok: true, order };
    } catch (error) {
      return {
        ok: false,
        reason: "error",
        message: error instanceof Error ? error.message : "The order could not be saved.",
      };
    }
  }

  const { data, error } = await supabase.rpc("place_order", {
    p_id: input.id,
    p_customer_name: input.customer_name,
    p_customer_email: input.customer_email,
    p_shipping_address: input.shipping_address,
    p_items: input.items,
    p_deposit_last4: input.deposit_last4,
  });

  if (error) return { ok: false, reason: "error", message: error.message };

  const order = normalizeOrder(data);
  if (!order) return { ok: false, reason: "error", message: "Unexpected order payload." };
  return { ok: true, order };
}

export async function payRemoteBalance(
  email: string,
  orderId: string,
  last4: string,
): Promise<RemoteResult<Order>> {
  if (!supabase) {
    try {
      const order = await payStoredBalance(email, orderId, last4);
      return { ok: true, order };
    } catch (error) {
      return {
        ok: false,
        reason: "error",
        message: error instanceof Error ? error.message : "The balance could not be saved.",
      };
    }
  }

  const { data, error } = await supabase.rpc("pay_balance", {
    p_email: email.trim(),
    p_order_id: orderId.trim(),
    p_last4: last4,
  });

  if (error) return { ok: false, reason: "error", message: error.message };

  const order = normalizeOrder(data);
  if (!order) return { ok: false, reason: "error", message: "Unexpected order payload." };
  return { ok: true, order };
}
