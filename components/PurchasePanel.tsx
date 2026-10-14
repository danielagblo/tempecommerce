"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { StockFigure, useLot } from "@/components/StockFigure";
import type { Product } from "@/lib/types";

export function PurchasePanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { left } = useLot(product);
  const [quantity, setQuantity] = useState(1);
  const soldOut = left < 1;
  const lot = { ...product, stock_quantity: left };

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex h-12 items-center justify-between rounded-full border border-line px-2 sm:w-36">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={soldOut}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="nums text-sm">{quantity}</span>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-ink/5"
            aria-label="Increase quantity"
            onClick={() =>
              setQuantity((current) => Math.min(left, current + 1))
            }
            disabled={soldOut || quantity >= left}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          className="btn-primary h-12 flex-1"
          disabled={soldOut}
          onClick={() => addItem(lot, quantity)}
        >
          {soldOut ? "Sold through" : "Add to cart"}
        </button>
      </div>
      {soldOut ? (
        <p className="mt-3 text-sm text-muted">This lot is sold through.</p>
      ) : (
        <StockFigure product={product} prominent />
      )}
    </div>
  );
}
