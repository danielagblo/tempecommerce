import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLogin } from "@/components/AdminLogin";
import { Container } from "@/components/Container";
import { isAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Orders and the homepage films.",
};

export default function AdminPage() {
  const signedIn = isAdmin();

  return (
    <main className="py-10 sm:py-16">
      <Container width="max-w-3xl">
        {signedIn ? (
          <AdminDashboard />
        ) : (
          <>
            <p className="eyebrow">Shop</p>
            <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-6xl">Admin</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Sign in to manage orders and the homepage films.
            </p>
            <AdminLogin />
          </>
        )}
      </Container>
    </main>
  );
}
