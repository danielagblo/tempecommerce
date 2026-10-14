import { ArrowRight, CreditCard, Truck, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { FaqList } from "@/components/FaqList";
import { StockFigure } from "@/components/StockFigure";
import { PendingOrders } from "@/components/PendingOrders";
import { ProductCard } from "@/components/ProductCard";
import { formatMoney, savingsPercent } from "@/lib/pricing";
import { products } from "@/lib/products";

const trust = [
  {
    icon: CreditCard,
    title: "50% now, 50% on arrival",
    copy: "The deposit is paid on this page today. The balance is paid on the tracking page after the parcel arrives. The order stores the last four digits, not the card number.",
  },
  {
    icon: Truck,
    title: "Tracked shipping",
    copy: "When a parcel leaves the workshop, status changes to Shipped and the international tracking number is published.",
  },
  {
    icon: Clock,
    title: "Stated transit window",
    copy: "8–15 business days is the line-haul from China. Customs can add time. That is written here, not hidden under a fast-shipping slogan.",
  },
];

export default function HomePage() {
  const featured = products.find((product) => product.id === "linen-throw") ?? products[0];
  const saved = featured.compare_at - featured.price;
  const percent = savingsPercent(featured.price, featured.compare_at);

  return (
    <main>
      <section className="border-b border-line">
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:py-28">
          <div>
            <p className="eyebrow">Source pricing · No domestic middleman</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              Direct Import Savings
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Workshop prices from China, set beside a typical retail tag. Packed weight, carton
              size, and an 8–15 business day delivery window are on the page before anything goes
              into the cart.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#shop" className="btn-primary">
                Shop the edit
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/track" className="btn-secondary">
                Track an order
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-line pt-6">
              <div>
                <dt className="eyebrow">Window</dt>
                <dd className="mt-2 font-serif text-2xl tracking-tight sm:text-3xl">8–15 days</dd>
              </div>
              <div>
                <dt className="eyebrow">Handoff</dt>
                <dd className="mt-2 font-serif text-2xl tracking-tight sm:text-3xl">Tracked</dd>
              </div>
              <div>
                <dt className="eyebrow">Duties</dt>
                <dd className="mt-2 font-serif text-2xl tracking-tight sm:text-3xl">Named</dd>
              </div>
            </dl>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-elevated sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={featured.images[0]}
              alt={featured.title}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-line bg-paper/95 p-5 backdrop-blur-sm">
              <p className="eyebrow">Typical retail {formatMoney(featured.compare_at)}</p>
              <p className="nums mt-2 font-serif text-4xl tracking-tight">
                {formatMoney(featured.price)}
              </p>
              <p className="mt-1 text-sm text-signal">
                You keep {formatMoney(saved)} · {percent}% under that tag
              </p>
              <StockFigure product={featured} />
              <p className="mt-3 text-xs leading-relaxed text-muted">
                {featured.title} · {featured.weight.toFixed(2)} kg packed · {featured.dimensions} ·{" "}
                {featured.shipping_time_estimate}
              </p>
              <Link
                href={`/product/${featured.id}`}
                className="mt-4 inline-flex text-sm underline-offset-4 hover:underline"
              >
                View the throw
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <PendingOrders />

      <section id="shop" className="scroll-mt-28 py-14 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">Four lots in stock</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">The current edit</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Typical retail is a street price for a comparable piece. It is a reference beside the
              Oriel price, so the saving is visible.
            </p>
          </div>
          <div className="mt-8 grid gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-line bg-elevated">
        <Container className="grid gap-10 py-16 sm:py-20 md:grid-cols-3">
          {trust.map((item) => (
            <div key={item.title}>
              <item.icon className="h-5 w-5" aria-hidden />
              <h2 className="mt-4 font-serif text-2xl tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.copy}</p>
            </div>
          ))}
        </Container>
      </section>

      <section id="faq" className="scroll-mt-28 py-20 sm:py-28">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">Transit, in writing</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              The 8–15 day window
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Direct import is slower than a domestic warehouse. The questions below are the ones
              we would rather answer before checkout.
            </p>
          </div>
          <div className="mt-10">
            <FaqList />
          </div>
        </Container>
      </section>
    </main>
  );
}
