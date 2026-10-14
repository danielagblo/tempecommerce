import Link from "next/link";
import { Container } from "@/components/Container";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-2xl tracking-tight">Oriel</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            A direct-import shop for goods made in China. The price, the carton, and the transit
            window stay on the page.
          </p>
        </div>
        <nav className="flex gap-5 text-sm">
          <Link href="/#vendors" className="hover:opacity-70">
            Workshops
          </Link>
          <Link href="/#shop" className="hover:opacity-70">
            Shop
          </Link>
          <Link href="/track" className="hover:opacity-70">
            Track
          </Link>
          <Link href="/#faq" className="hover:opacity-70">
            FAQ
          </Link>
        </nav>
      </Container>
      <Container className="border-t border-line py-5 text-xs text-muted">
        © {new Date().getFullYear()} Oriel
      </Container>
    </footer>
  );
}
