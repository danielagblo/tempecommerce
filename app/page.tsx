import { HeroVideo } from "@/components/HeroVideo";

export default function HomePage() {
  return (
    <main className="fixed inset-0 z-0">
      <section className="relative h-full w-full overflow-hidden">
        <HeroVideo />
      </section>
    </main>
  );
}
