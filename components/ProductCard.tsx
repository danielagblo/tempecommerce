import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductRating } from "@/components/ProductReviews";
import { StockFigure } from "@/components/StockFigure";
import { formatMoney } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex items-center gap-3 sm:flex-col sm:items-stretch">
      <Link href={`/product/${product.id}`} className="flex min-w-0 flex-1 items-center gap-3 sm:block">
        <div className="relative h-[5.25rem] w-[5.25rem] shrink-0 overflow-hidden rounded-xl bg-elevated sm:aspect-square sm:h-auto sm:w-auto sm:rounded-2xl">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(min-width: 640px) 45vw, 84px"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
        </div>
        <div className="min-w-0 flex-1 sm:contents">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted sm:mt-4 sm:text-[11px] sm:tracking-[0.18em]">
            {product.origin}
          </p>
          <h3 className="mt-0.5 font-serif text-lg leading-tight tracking-tight sm:mt-1 sm:text-2xl">
            {product.title}
          </h3>
          <div className="mt-1">
            <ProductRating productId={product.id} starClassName="h-3 w-3" />
          </div>
          <StockFigure product={product} />
          <div className="mt-1 flex items-baseline gap-2 sm:mt-2 sm:justify-between">
            <p className="nums text-sm">{formatMoney(product.price)}</p>
            <p className="nums text-xs text-muted line-through sm:text-sm">
              {formatMoney(product.compare_at)}
            </p>
          </div>
          <p className="mt-1 hidden text-xs leading-relaxed text-muted sm:block">
            {product.weight.toFixed(2)} kg packed · {product.shipping_time_estimate}
          </p>
        </div>
      </Link>
      <AddToCartButton
        product={product}
        compactLabel="Add"
        className="h-9 shrink-0 px-3.5 py-0 text-xs sm:mt-4 sm:h-auto sm:w-full sm:px-5 sm:py-3 sm:text-sm"
      />
    </article>
  );
}
