import type { Review } from "@/lib/types";

const KEY = "oriel-reviews";
export const REVIEWS_EVENT = "oriel-reviews";

export const seedReviews: Review[] = [
  {
    id: "rv-cups-1",
    product_id: "studio-cups",
    author: "Mina Alvarez",
    rating: 5,
    body: "The four cups do not match, which is what the page promised. The glaze that arrived is the one in the third photo.",
    created_at: "2026-08-12",
  },
  {
    id: "rv-cups-2",
    product_id: "studio-cups",
    author: "Jonah Ellis",
    rating: 4,
    body: "One rim is a little uneven. They stack, and the pulp tray came through the flight intact.",
    created_at: "2026-07-03",
  },
  {
    id: "rv-cups-3",
    product_id: "studio-cups",
    author: "Priya Shah",
    rating: 5,
    body: "Heavier than a factory cup. The wait matched the 8–15 day window.",
    created_at: "2026-05-19",
  },
  {
    id: "rv-linen-1",
    product_id: "linen-throw",
    author: "Helen Cho",
    rating: 5,
    body: "It arrived in oat, wrinkled from the carton, and settled after a day on the sofa.",
    created_at: "2026-09-02",
  },
  {
    id: "rv-linen-2",
    product_id: "linen-throw",
    author: "Samir Haddad",
    rating: 4,
    body: "Soft after the wash. Folded, it is smaller than I pictured, which matches the carton size.",
    created_at: "2026-06-28",
  },
  {
    id: "rv-linen-3",
    product_id: "linen-throw",
    author: "Nora Blake",
    rating: 5,
    body: "The color is quieter than the photographs. I prefer that.",
    created_at: "2026-04-11",
  },
  {
    id: "rv-lamp-1",
    product_id: "arc-floor-lamp",
    author: "Chris Dalton",
    rating: 4,
    body: "The carton is long, as listed. Graphite matches the first photo. The stem seats into the base.",
    created_at: "2026-08-21",
  },
  {
    id: "rv-lamp-2",
    product_id: "arc-floor-lamp",
    author: "Elena Voss",
    rating: 5,
    body: "The arc clears a sofa. The bulb was not included, which the page already says.",
    created_at: "2026-07-16",
  },
  {
    id: "rv-lamp-3",
    product_id: "arc-floor-lamp",
    author: "Owen Park",
    rating: 3,
    body: "The cord is two-prong, so I needed an adapter. The shade itself is even.",
    created_at: "2026-03-30",
  },
  {
    id: "rv-tote-1",
    product_id: "woven-leather-tote",
    author: "Lila Nguyen",
    rating: 5,
    body: "The weave is tight. The chain strap is heavier than it looks in the photo.",
    created_at: "2026-09-18",
  },
  {
    id: "rv-tote-2",
    product_id: "woven-leather-tote",
    author: "Marcus Reid",
    rating: 4,
    body: "The leather smell faded after a week. No logo, which is what I ordered.",
    created_at: "2026-06-09",
  },
  {
    id: "rv-tote-3",
    product_id: "woven-leather-tote",
    author: "Amina Yusuf",
    rating: 5,
    body: "A laptop sleeve fits. The stitching on the base is straight.",
    created_at: "2026-02-14",
  },
];

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false;
  const review = value as Partial<Review>;
  return (
    typeof review.id === "string" &&
    typeof review.product_id === "string" &&
    typeof review.author === "string" &&
    typeof review.rating === "number" &&
    review.rating >= 1 &&
    review.rating <= 5 &&
    typeof review.body === "string" &&
    typeof review.created_at === "string"
  );
}

export function readStoredReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isReview) : [];
  } catch {
    return [];
  }
}

export function reviewsFor(productId: string, stored: Review[] = []): Review[] {
  return [...stored, ...seedReviews.filter((review) => review.product_id === productId)]
    .filter((review) => review.product_id === productId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

export function saveReview(review: Review): void {
  if (typeof window === "undefined") return;
  const next = [review, ...readStoredReviews().filter((existing) => existing.id !== review.id)];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(REVIEWS_EVENT));
}
