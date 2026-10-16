"use client";

import { Moon, ShoppingBag, Sun, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/CartContext";
import { Container } from "@/components/Container";
import { HERO_SOUND_EVENT } from "@/components/HeroVideo";

export function Navbar() {
  const { count, openCart } = useCart();
  const pathname = usePathname();
  const home = pathname === "/";
  const overVideo = home;
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    function onState(event: Event) {
      setMuted((event as CustomEvent<boolean>).detail);
    }
    window.addEventListener("oriel-hero-sound-state", onState);
    return () => window.removeEventListener("oriel-hero-sound-state", onState);
  }, []);

  function toggleSound() {
    const next = !muted;
    setMuted(next);
    window.dispatchEvent(new CustomEvent(HERO_SOUND_EVENT, { detail: next }));
  }

  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("oriel-theme", next);
  }

  return (
    <header
      className={
        home
          ? `fixed inset-x-0 top-0 z-40 ${
              overVideo
                ? "border-b border-transparent bg-transparent text-white drop-shadow-[0_1px_2px_rgb(0_0_0/0.65)]"
                : "border-b border-line/80 bg-paper/85 text-ink backdrop-blur-md"
            }`
          : "sticky top-0 z-40 border-b border-line/80 bg-paper/85 text-ink backdrop-blur-md"
      }
    >
      <Container>
        <div className="flex items-center justify-between gap-3 py-3.5">
          <Link href="/" className="font-serif text-xl tracking-tight">
            Oriel
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-6">
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
          <div className="flex items-center">
            {home ? (
              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={!muted}
                aria-label={muted ? "Turn sound on" : "Turn sound off"}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-xs hover:bg-white/15"
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                {muted ? "Unmute" : "Mute"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex h-10 w-10 items-center justify-center rounded-full ${overVideo ? "hover:bg-white/15" : "hover:bg-ink/5"}`}
              aria-label="Toggle color theme"
            >
              <Sun className="hidden h-4 w-4 dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>
            <button
              type="button"
              onClick={openCart}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full ${overVideo ? "hover:bg-white/15" : "hover:bg-ink/5"}`}
              aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 ? (
                <span
                  className={`nums absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] ${overVideo ? "bg-white text-[#161513]" : "bg-ink text-paper"}`}
                >
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
