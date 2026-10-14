import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/Container";
import { TrackForm } from "@/components/TrackForm";

export const metadata: Metadata = {
  title: "Track an order",
  description:
    "Look up an Oriel order with the email and order ID from your confirmation. See fulfillment status and the international tracking number.",
};

export default function TrackPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container width="max-w-3xl">
        <p className="eyebrow">Fulfillment</p>
        <h1 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">Track an order</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          Enter the email and order ID from your confirmation. You will see the status, the
          supplier reference, and the international tracking number once the carrier has scanned
          the parcel.
        </p>
        <Suspense fallback={<p className="mt-10 text-sm text-muted">Opening the tracking desk…</p>}>
          <TrackForm />
        </Suspense>
      </Container>
    </main>
  );
}
