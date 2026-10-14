import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Container } from "@/components/Container";
import { FaqList } from "@/components/FaqList";
import { PendingOrders } from "@/components/PendingOrders";
import { ProductCard } from "@/components/ProductCard";
import { StarRating } from "@/components/StarRating";
import { StockFigure } from "@/components/StockFigure";
import { VendorJoin } from "@/components/VendorJoin";
import { seedReviews } from "@/lib/reviews";
import { formatMoney, savingsPercent, SHIPPING_FLAT } from "@/lib/pricing";
import { products } from "@/lib/products";

const terms = [
  {
    index: "01",
    title: "The house price",
    copy: "Each piece is priced from the workshop. A typical retail tag sits beside it as a reference, so the amount you keep is visible before you order.",
  },
  {
    index: "02",
    title: "Half, then half",
    copy: "Pay 50% on this page to place the order. Pay the other 50% on the tracking page after the status changes to Arrived. The order keeps the last four digits of the card.",
  },
  {
    index: "03",
    title: "The carton, named",
    copy: "Packed weight and carton size are on the listing. The $12 shipping line is a published contribution toward tracked line-haul, not a carrier quote.",
  },
  {
    index: "04",
    title: "A written window",
    copy: "8–15 business days from the workshop handoff. The tracking number appears when the carrier scans the parcel. If customs charges duty, customs bills you.",
  },
];

const quoteIds = ["rv-linen-1", "rv-cups-3", "rv-tote-1"];

export default function HomePage() {
  const featured = products.find((product) => product.id === "linen-throw") ?? products[0];
  const saved = featured.compare_at - featured.price;
  const percent = savingsPercent(featured.price, featured.compare_at);
  const house = products.reduce((sum, product) => sum + product.price, 0);
  const retail = products.reduce((sum, product) => sum + product.compare_at, 0);
  const kept = retail - house;
  const quotes = quoteIds
    .map((id) => seedReviews.find((review) => review.id === id))
    .filter((review) => review !== undefined);

  return (
    <main>
      <section className="border-b border-line">
        <Container className="grid items-end gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-24">
          <div>
            <p className="eyebrow">Oriel dealership</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              Order at the house price
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Four lots from workshops in China. The retail tag, the packed carton, and the day the
              parcel should arrive are on the page before you pay. Half places the order. Half is
              due when it arrives.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#shop" className="btn-primary">
                See the floor
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#terms" className="btn-secondary">
                How an order is paid
              </a>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6 sm:grid-cols-4">
              <div>
                <dt className="eyebrow">One of each</dt>
                <dd className="nums mt-2 font-serif text-3xl tracking-tight">{formatMoney(house)}</dd>
                <dd className="mt-1 text-xs text-muted">against {formatMoney(retail)}</dd>
              </div>
              <div>
                <dt className="eyebrow">You keep</dt>
                <dd className="nums mt-2 font-serif text-3xl tracking-tight text-signal">
                  {formatMoney(kept)}
                </dd>
                <dd className="mt-1 text-xs text-muted">before the shipping line</dd>
              </div>
              <div>
                <dt className="eyebrow">To order</dt>
                <dd className="mt-2 font-serif text-3xl tracking-tight">50%</dd>
                <dd className="mt-1 text-xs text-muted">balance on arrival</dd>
              </div>
              <div>
                <dt className="eyebrow">Window</dt>
                <dd className="mt-2 font-serif text-3xl tracking-tight">8–15</dd>
                <dd className="mt-1 text-xs text-muted">business days, tracked</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-line bg-elevated">
            <div className="relative aspect-[5/4] bg-paper">
              <Image
                src={featured.images[0]}
                alt={featured.title}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-5 sm:p-6">
              <p className="eyebrow">{featured.origin}</p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight">{featured.title}</h2>
              <p className="mt-2 text-sm text-muted">
                {featured.id === "linen-throw"
                  ? `${featured.material} · open about 140 × 180 cm · ships in oat`
                  : featured.material}
              </p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="nums font-serif text-4xl tracking-tight">{formatMoney(featured.price)}</p>
                  <p className="nums text-sm text-muted line-through">{formatMoney(featured.compare_at)}</p>
                </div>
                <p className="text-right text-sm text-signal">
                  Keep {formatMoney(saved)}
                  <span className="mt-1 block text-xs">{percent}% under that tag</span>
                </p>
              </div>
              <StockFigure product={featured} />
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {featured.weight.toFixed(2)} kg packed · {featured.dimensions} ·{" "}
                {featured.shipping_time_estimate}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <AddToCartButton
                  product={featured}
                  label="Order this throw"
                  tone="primary"
                  className="w-full sm:flex-1"
                />
                <Link href={`/product/${featured.id}`} className="btn-secondary w-full sm:w-auto">
                  Full listing
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="shop" className="scroll-mt-28 border-b border-line">
        <Container className="py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow">The floor sheet</p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                What is on the floor
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              One of each is {formatMoney(house)} at Oriel and {formatMoney(retail)} at a typical
              retail tag. You keep {formatMoney(kept)}. Tracked shipping is {formatMoney(SHIPPING_FLAT)}{" "}
              on the order.
            </p>
          </div>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {products.map((product) => {
              const keep = product.compare_at - product.price;
              return (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.id}`}
                    className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1.4fr)_auto_auto] sm:items-center sm:gap-8"
                  >
                    <span>
                      <span className="block font-medium">{product.title}</span>
                      <span className="mt-1 block text-xs text-muted">
                        {product.origin} · {product.material} · {product.weight.toFixed(2)} kg ·{" "}
                        {product.dimensions}
                      </span>
                    </span>
                    <span className="flex items-baseline gap-3 sm:block sm:text-right">
                      <span className="nums text-sm">{formatMoney(product.price)}</span>
                      <span className="nums text-xs text-muted line-through sm:mt-1 sm:block">
                        {formatMoney(product.compare_at)}
                      </span>
                    </span>
                    <span className="text-sm text-signal sm:text-right">
                      Keep {formatMoney(keep)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-14">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section id="terms" className="scroll-mt-28 border-b border-line bg-elevated">
        <Container className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">Before you send the link</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              What the buyer is agreeing to
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              These four lines are the deal. Nothing about duty, timing, or the second payment is
              left for a message after checkout.
            </p>
          </div>
          <ol className="divide-y divide-line border-y border-line">
            {terms.map((term) => (
              <li key={term.index} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
                <span className="nums font-serif text-lg text-muted">{term.index}</span>
                <div>
                  <p className="font-serif text-2xl tracking-tight">{term.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{term.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-b border-line">
        <Container className="py-16 sm:py-24">
          <p className="eyebrow">From people who ordered</p>
          <h2 className="mt-3 max-w-xl font-serif text-4xl tracking-tight sm:text-5xl">
            The piece arrived as the page described it
          </h2>
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {quotes.map((quote) => {
              const product = products.find((item) => item.id === quote.product_id);
              return (
                <li key={quote.id} className="flex flex-col rounded-[28px] border border-line p-6">
                  <StarRating value={quote.rating} />
                  <p className="mt-4 flex-1 text-sm leading-relaxed">{quote.body}</p>
                  <p className="mt-6 text-xs text-muted">
                    {quote.author}
                    {product ? ` · ${product.title}` : ""}
                  </p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <VendorJoin />
      <PendingOrders />

      <section id="faq" className="scroll-mt-28 py-16 sm:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">If they ask</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              The questions that come before an order
            </h2>
          </div>
          <div className="mt-10">
            <FaqList />
          </div>
        </Container>
      </section>
    </main>
  );
}
