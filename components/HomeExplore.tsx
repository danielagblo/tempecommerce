"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

function cityOf(origin: string): string {
  return origin.split(",")[0]?.trim() || origin;
}

export function HomeExplore({ products }: { products: Product[] }) {
  const cities = Array.from(new Set(products.map((product) => cityOf(product.origin))));
  const [city, setCity] = useState<string>("All");
  const shown =
    city === "All" ? products : products.filter((product) => cityOf(product.origin) === city);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...cities].map((name) => {
          const on = name === city;
          return (
            <button
              key={name}
              type="button"
              onClick={() => setCity(name)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm ${
                on ? "bg-ink text-paper" : "border border-line text-ink hover:bg-ink/5"
              }`}
              aria-pressed={on}
            >
              {name}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-muted">
        {shown.length} {shown.length === 1 ? "lot" : "lots"}
        {city === "All" ? " open right now" : ` in ${city}`}
      </p>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14">
        {shown.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
