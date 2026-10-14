"use client";

import { useCart } from "@/components/CartContext";
import { useLot } from "@/components/StockFigure";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  quantity = 1,
  className = "",
  label = "Add to cart",
  compactLabel,
}: {
  product: Product;
  quantity?: number;
  className?: string;
  label?: string;
  compactLabel?: string;
}) {
  const { addItem } = useCart();
  const { left } = useLot(product);
  const soldOut = left < 1;
  const lot = { ...product, stock_quantity: left };

  return (
    <button
      type="button"
      className={`btn-secondary ${className}`}
      disabled={soldOut}
      onClick={() => addItem(lot, quantity)}
    >
      {soldOut ? (
        "Sold through"
      ) : compactLabel ? (
        <>
          <span className="sm:hidden">{compactLabel}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
