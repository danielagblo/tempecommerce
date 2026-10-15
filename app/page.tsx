import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/Container";
import { FaqList } from "@/components/FaqList";
import { HomeExplore } from "@/components/HomeExplore";
import { PendingOrders } from "@/components/PendingOrders";
import { SourceRequest } from "@/components/SourceRequest";
import { StarRating } from "@/components/StarRating";
import { VendorJoin } from "@/components/VendorJoin";
import { demoOrders } from "@/lib/demo-orders";
import { formatMoney, SHIPPING_FLAT } from "@/lib/pricing";
import { products } from "@/lib/products";
import { seedReviews } from "@/lib/reviews";

const quoteIds = ["rv-linen-1", "rv-cups-3", "rv-tote-1"];

function cityOf(origin: string): string {
  return origin.split(",")[0]?.trim() || origin;
}

function placeOf(address: string): string {
  const parts = address.split(",").map((part) => part.trim());
  return parts[1] || parts[0] || "";
}

const statusLabel: Record<string, string> = {
  arrived: "Landed",
  shipped: "On the way",
};

export default function HomePage() {
  const house = products.reduce((sum, product) => sum + product.price, 0);
  const retail = products.reduce((sum, product) => sum + product.compare_at, 0);
  const kept = retail - house;
  const shots = products.flatMap((product) =>
    product.images.map((src, index) => ({
      src,
      index,
      product,
    })),
  );
  const landed = demoOrders.filter(
    (order) => order.status === "arrived" || order.status === "shipped",
  );
  const quotes = quoteIds
    .map((id) => seedReviews.find((review) => review.id === id))
    .filter((review) => review !== undefined);
  const hero = [
    products.find((product) => product.id === "linen-throw"),
    products.find((product) => product.id === "studio-cups"),
    products.find((product) => product.id === "woven-leather-tote"),
  ].filter((product) => product !== undefined);

  return (
    <main>
      <section className="border-b border-line">
        <Container className="grid items-center gap-10 py-8 sm:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="eyebrow">Oriel sourcing</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.95] tracking-tight sm:text-7xl">
              The gallery is the shop.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
              Oriel sources from workshops in China and puts the lot on this page. Open a photo,
              see the orders that already landed, or ask her to find the next one. Half starts it.
              The rest is due when your box arrives.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#explore" className="btn-primary">
                Explore the lots
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#gallery" className="btn-secondary">
                Open the gallery
              </a>
            </div>
            <p className="mt-4 text-sm">
              <a href="#source" className="underline-offset-4 hover:underline">
                Ask her to source something
              </a>
            </p>
            <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <div>
                <dt className="text-muted">Workshops</dt>
                <dd className="nums font-medium">4 cities</dd>
              </div>
              <div>
                <dt className="text-muted">To start</dt>
                <dd className="font-medium">Half now</dd>
              </div>
              <div>
                <dt className="text-muted">Window</dt>
                <dd className="font-medium">8–15 days, tracked</dd>
              </div>
              <div>
                <dt className="text-muted">A full set</dt>
                <dd className="font-medium text-signal">Keep {formatMoney(kept)}</dd>
              </div>
            </dl>
          </div>

          <div className="order-1 grid grid-cols-2 gap-2 sm:gap-3 lg:order-2">
            {hero.map((product, index) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className={`group relative overflow-hidden rounded-[22px] bg-elevated ${
                  index === 0 ? "col-span-2 aspect-[5/4]" : "aspect-[3/4]"
                }`}
              >
                <Image
                  src={product.images[0]}
                  alt={product.title}
                  fill
                  priority={index === 0}
                  sizes={index === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 24vw, 50vw"}
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white sm:p-4">
                  <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/80">
                    {cityOf(product.origin)}
                  </span>
                  <span className="mt-1 block font-serif text-lg leading-tight tracking-tight sm:text-2xl">
                    {product.title}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section id="gallery" className="scroll-mt-28 border-b border-line">
        <Container className="py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="eyebrow">Her gallery</p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                Every photo is a lot she sourced
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted">
              Tap a frame. The listing has the workshop, the carton, and the price next to a typical
              tag.
            </p>
          </div>
          <ul className="mt-8 columns-2 gap-3 sm:columns-3 sm:gap-4">
            {shots.map((shot) => (
              <li key={`${shot.product.id}-${shot.index}`} className="mb-3 break-inside-avoid sm:mb-4">
                <Link href={`/product/${shot.product.id}`} className="group block">
                  <span
                    className={`relative block overflow-hidden rounded-2xl bg-elevated ${
                      shot.index % 3 === 0 ? "aspect-[3/4]" : shot.index % 3 === 1 ? "aspect-square" : "aspect-[4/5]"
                    }`}
                  >
                    <Image
                      src={shot.src}
                      alt={`${shot.product.title}, photo ${shot.index + 1}`}
                      fill
                      sizes="(min-width: 640px) 30vw, 50vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </span>
                  <span className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-sm">{shot.product.title}</span>
                    <span className="nums text-xs text-muted">{formatMoney(shot.product.price)}</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-[0.14em] text-muted">
                    {cityOf(shot.product.origin)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="landed" className="scroll-mt-28 border-b border-line bg-elevated">
        <Container className="py-14 sm:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">Orders that made it</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              These already left the workshop
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              A landed order and one still on a tracking number. Same path yours takes: half to
              start, the rest when it arrives, then a scan you can look up.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 lg:grid-cols-2">
            {landed.map((order) => (
              <li key={order.id} className="rounded-[28px] border border-line bg-paper p-4 sm:p-5">
                <div className="flex gap-2">
                  {order.items.map((item) => {
                    const product = products.find((entry) => entry.id === item.product_id);
                    if (!product) return null;
                    return (
                      <Link
                        key={item.id}
                        href={`/product/${product.id}`}
                        aria-label={product.title}
                        className="relative h-24 w-20 overflow-hidden rounded-xl bg-elevated sm:h-28 sm:w-24"
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <p className="font-serif text-2xl tracking-tight">{order.id}</p>
                  <p className="text-sm text-signal">{statusLabel[order.status] ?? order.status}</p>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {order.customer_name.split(" ")[0]} · {placeOf(order.shipping_address)}
                </p>
                <ul className="mt-3 space-y-1 text-sm">
                  {order.items.map((item) => {
                    const product = products.find((entry) => entry.id === item.product_id);
                    return (
                      <li key={item.id}>
                        {product?.title ?? item.product_id}
                        {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                      </li>
                    );
                  })}
                </ul>
                {order.tracking_number ? (
                  <p className="nums mt-3 text-xs text-muted">{order.tracking_number}</p>
                ) : null}
                <Link href="/track" className="mt-4 inline-flex text-sm underline-offset-4 hover:underline">
                  Look this order up
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section id="explore" className="scroll-mt-28 border-b border-line">
        <Container className="py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <p className="eyebrow">Explore</p>
              <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                Pick a city, open a lot
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              One of each is {formatMoney(house)} here and {formatMoney(retail)} at a typical tag.
              You keep {formatMoney(kept)}. Tracked shipping is {formatMoney(SHIPPING_FLAT)}.
            </p>
          </div>
          <div className="mt-8">
            <HomeExplore products={products} />
          </div>
        </Container>
      </section>

      <SourceRequest />

      <section className="border-b border-line">
        <Container className="py-14 sm:py-20">
          <p className="eyebrow">From the unbox</p>
          <h2 className="mt-3 max-w-xl font-serif text-4xl tracking-tight sm:text-5xl">
            Notes from people who got the box
          </h2>
          <ul className="mt-8 grid gap-4 lg:grid-cols-3">
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

      <section id="faq" className="scroll-mt-28 py-14 sm:py-20">
        <Container>
          <div className="max-w-2xl">
            <p className="eyebrow">Before you send it</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
              The questions people ask first
            </h2>
          </div>
          <div className="mt-8">
            <FaqList />
          </div>
        </Container>
      </section>
    </main>
  );
}
