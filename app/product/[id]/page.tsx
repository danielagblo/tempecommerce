import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { DeliveryNotice } from "@/components/DeliveryNotice";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductRating, ProductReviews } from "@/components/ProductReviews";
import { PurchasePanel } from "@/components/PurchasePanel";
import { formatMoney } from "@/lib/pricing";
import { getProduct, getRelatedProducts, products } from "@/lib/products";

type ProductPageProps = {
  params: { id: string };
};

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProduct(params.id);
  if (!product) return { title: "Product" };
  return { title: product.title, description: product.description };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProduct(params.id);
  if (!product) notFound();

  const saved = product.compare_at - product.price;
  const specs = [
    { label: "Packed weight", value: `${product.weight.toFixed(2)} kg` },
    { label: "Carton", value: product.dimensions },
    { label: "Origin", value: product.origin },
    { label: "Material", value: product.material },
    { label: "Transit", value: product.shipping_time_estimate },
  ];

  return (
    <main className="py-10 sm:py-16">
      <Container>
        <nav className="text-sm text-muted">
          <Link href="/#shop" className="hover:text-ink">
            Shop
          </Link>
          <span aria-hidden className="px-2">
            /
          </span>
          <span className="text-ink">{product.title}</span>
        </nav>

        <div className="mt-8 grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} title={product.title} />
          <div>
            <p className="eyebrow">{product.origin}</p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{product.title}</h1>
            <a href="#reviews" className="mt-3 inline-flex hover:opacity-70">
              <ProductRating productId={product.id} starClassName="h-4 w-4" />
            </a>
            <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="nums font-serif text-4xl tracking-tight">{formatMoney(product.price)}</p>
              <p className="nums pb-1 text-sm text-muted line-through">
                {formatMoney(product.compare_at)}
              </p>
            </div>
            <p className="mt-2 text-sm text-signal">
              {formatMoney(saved)} under a typical retail tag
            </p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              {product.description}
            </p>
            <DeliveryNotice />
            <PurchasePanel product={product} />
            <dl className="mt-8 divide-y divide-line border-y border-line">
              {specs.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-6 py-3 text-sm">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
            <a
              href={product.china_supplier_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm underline-offset-4 hover:underline"
            >
              Workshop listing
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <ProductReviews productId={product.id} />

        <section className="mt-20 sm:mt-28">
          <h2 className="font-serif text-3xl tracking-tight">The rest of the edit</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {getRelatedProducts(product.id).map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
