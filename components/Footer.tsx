import Link from "next/link";
import { Container } from "@/components/Container";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-2xl tracking-tight">Oriel</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Oriel sources goods from workshops in China. The gallery, the landed orders, and the
            price stay on the page.
          </p>
        </div>
        <nav className="flex gap-5 text-sm">
          <Link href="/#gallery" className="hover:opacity-70">
            Gallery
          </Link>
          <Link href="/#explore" className="hover:opacity-70">
            Explore
          </Link>
          <Link href="/#landed" className="hover:opacity-70">
            Landed
          </Link>
          <Link href="/#source" className="hover:opacity-70">
            Source
          </Link>
          <Link href="/track" className="hover:opacity-70">
            Track
          </Link>
        </nav>
      </Container>
      <Container className="border-t border-line py-5 text-xs text-muted">
        © {new Date().getFullYear()} Oriel
      </Container>
    </footer>
  );
}
