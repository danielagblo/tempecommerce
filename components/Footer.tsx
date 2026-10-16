"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/Container";

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-2xl tracking-tight">Oriel</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Pieces from workshops in China. Half now, half when it gets to you.
          </p>
        </div>
        <nav className="flex gap-5 text-sm">
          <Link href="/" className="hover:opacity-70">
            Home
          </Link>
          <Link href="/gallery" className="hover:opacity-70">
            Gallery
          </Link>
          <Link href="/orders" className="hover:opacity-70">
            Orders
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
