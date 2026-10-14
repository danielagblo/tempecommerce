"use client";

import { Moon, ShoppingBag, Sun } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { Container } from "@/components/Container";

export function Navbar() {
  const { count, openCart } = useCart();

  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("oriel-theme", next);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="bg-ink px-4 py-2 text-center text-[11px] tracking-wide text-paper sm:text-xs">
        Tracked shipping from China · Estimated delivery 8–15 business days
      </div>
      <Container>
        <div className="flex items-center justify-between gap-3 py-3.5">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Oriel
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <Link href="/#vendors" className="hover:opacity-70">
              Join
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
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5"
              aria-label="Toggle color theme"
            >
              <Sun className="hidden h-4 w-4 dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>
            <button
              type="button"
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5"
              aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 ? (
                <span className="nums absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] text-paper">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
