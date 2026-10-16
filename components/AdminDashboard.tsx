"use client";

import { useRouter } from "next/navigation";
import { AdminHero } from "@/components/AdminHero";
import { AdminOrders } from "@/components/AdminOrders";

export function AdminDashboard() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Shop</p>
          <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-6xl">Dashboard</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Orders and homepage films are stored on the server. A new checkout shows up here, and
            tracking uses the same record.
          </p>
        </div>
        <button type="button" className="text-sm text-muted hover:text-ink" onClick={() => void logout()}>
          Log out
        </button>
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-3xl tracking-tight">Orders</h2>
        <AdminOrders />
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-3xl tracking-tight">Hero films</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          Pick a product on any film and an order button shows on the homepage while that film is
          playing.
        </p>
        <AdminHero />
      </section>
    </>
  );
}
