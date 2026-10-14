import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <main className="py-24">
      <Container>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 max-w-xl font-serif text-5xl tracking-tight">
          This page is not in the catalog.
        </h1>
        <Link href="/" className="btn-primary mt-8">
          Back to the shop
        </Link>
      </Container>
    </main>
  );
}
