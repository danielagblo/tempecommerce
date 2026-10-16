import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { HomeExplore } from "@/components/HomeExplore";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Gallery",
  description: "What's in right now. Tap a photo, pay half to start it, and the rest when it shows up.",
};

export default function GalleryPage() {
  return (
    <main className="pb-16">
      <Container className="pb-2 pt-8 sm:pt-12">
        <h1 className="max-w-xl font-serif text-4xl leading-[1] tracking-tight sm:text-6xl">
          What&apos;s in right now.
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          Tap a photo. Pay half to start it, and the rest when it shows up. Most orders get here in
          8–15 days, and you can track them.
        </p>
      </Container>
      <HomeExplore products={products} />
    </main>
  );
}
