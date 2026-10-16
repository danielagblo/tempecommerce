import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { OrderBoard } from "@/components/OrderBoard";

export const metadata: Metadata = {
  title: "Orders",
  description:
    "See what people ordered, what’s paid, and where the box is. Half now, the rest when it arrives.",
};

export default function OrdersPage() {
  return (
    <main className="py-10 sm:py-16">
      <Container width="max-w-3xl">
        <h1 className="font-serif text-4xl tracking-tight sm:text-6xl">Orders</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Pay half to start. Pay the rest when the box gets to you. The ones that need you are at
          the top.
        </p>
        <p className="mt-3 text-sm">
          <Link href="/track" className="underline-offset-4 hover:underline">
            Got an order ID? Look yours up
          </Link>
        </p>
        <OrderBoard />
      </Container>
    </main>
  );
}
