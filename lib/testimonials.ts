import { seedReviews } from "@/lib/reviews";

type Clip = {
  src: string;
  poster: string;
};

const catalog: Record<string, Clip[]> = {
  "studio-cups": [
    { src: "/testimonials/cups-a.mp4", poster: "/products/cups-1.jpg" },
    { src: "/testimonials/cups-b.mp4", poster: "/products/cups-2.jpg" },
    { src: "/testimonials/cups-c.mp4", poster: "/products/cups-3.jpg" },
  ],
  "linen-throw": [
    { src: "/testimonials/linen-a.mp4", poster: "/products/linen-1.jpg" },
    { src: "/testimonials/linen-b.mp4", poster: "/products/linen-2.jpg" },
    { src: "/testimonials/linen-c.mp4", poster: "/products/linen-3.jpg" },
  ],
  "arc-floor-lamp": [
    { src: "/testimonials/lamp-a.mp4", poster: "/products/lamp-1.jpg" },
    { src: "/testimonials/lamp-b.mp4", poster: "/products/lamp-2.jpg" },
    { src: "/hero-6.mp4", poster: "/hero-6.jpg" },
  ],
  "woven-leather-tote": [
    { src: "/testimonials/tote-a.mp4", poster: "/products/tote-1.jpg" },
    { src: "/testimonials/tote-b.mp4", poster: "/hero-7.jpg" },
    { src: "/hero-7.mp4", poster: "/hero-7.jpg" },
  ],
};

const shared: Clip[] = [
  { src: "/hero.mp4", poster: "/hero-1.jpg" },
  { src: "/hero-3.mp4", poster: "/hero-3.jpg" },
  { src: "/hero-2.mp4", poster: "/hero-2.jpg" },
  { src: "/hero-4.mp4", poster: "/hero-4.jpg" },
  { src: "/hero-5.mp4", poster: "/hero-5.jpg" },
  { src: "/hero-6.mp4", poster: "/hero-6.jpg" },
  { src: "/hero-7.mp4", poster: "/hero-7.jpg" },
];

export type VideoTestimony = Clip & {
  id: string;
  author: string;
  quote: string;
  rating: number;
};

export function videoTestimonials(productId: string): VideoTestimony[] {
  const own = catalog[productId] ?? [];
  const reviews = seedReviews.filter((review) => review.product_id === productId);
  const rest = [...shared, ...Object.values(catalog).flat()].filter(
    (clip, index, all) => all.findIndex((item) => item.src === clip.src) === index && !own.some((item) => item.src === clip.src),
  );
  return [...own, ...rest].map((clip, index) => {
    const review = index < own.length ? reviews[index] : undefined;
    return {
      ...clip,
      id: `${productId}-${index}-${clip.src}`,
      author: review?.author ?? "",
      quote: review?.body ?? "",
      rating: review?.rating ?? 0,
    };
  });
}
