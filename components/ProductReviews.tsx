"use client";

import { useEffect, useState, type FormEvent } from "react";
import { StarPicker, StarRating } from "@/components/StarRating";
import {
  REVIEWS_EVENT,
  averageRating,
  readStoredReviews,
  reviewsFor,
  saveReview,
} from "@/lib/reviews";
import type { Review } from "@/lib/types";

function useProductReviews(productId: string): Review[] {
  const [stored, setStored] = useState<Review[]>([]);

  useEffect(() => {
    function load() {
      setStored(readStoredReviews());
    }
    load();
    window.addEventListener(REVIEWS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(REVIEWS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return reviewsFor(productId, stored);
}

function formatReviewDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function ProductRating({
  productId,
  starClassName = "h-3.5 w-3.5",
}: {
  productId: string;
  starClassName?: string;
}) {
  const reviews = useProductReviews(productId);
  if (reviews.length === 0) return null;
  const average = averageRating(reviews);

  return (
    <span className="inline-flex items-center gap-2">
      <StarRating value={average} className={starClassName} />
      <span className="nums text-xs text-muted">
        {average.toFixed(1)} · {reviews.length}
      </span>
    </span>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const reviews = useProductReviews(productId);
  const average = averageRating(reviews);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1) {
      setError("Choose a star rating.");
      return;
    }
    if (author.trim().length < 2) {
      setError("Enter the name to show with the review.");
      return;
    }
    if (body.trim().length < 12) {
      setError("Write a short note about the piece.");
      return;
    }
    saveReview({
      id: `rv-${Date.now().toString(36)}`,
      product_id: productId,
      author: author.trim(),
      rating,
      body: body.trim(),
      created_at: new Date().toISOString().slice(0, 10),
    });
    setAuthor("");
    setBody("");
    setRating(0);
    setError(null);
  }

  return (
    <section id="reviews" className="mt-20 scroll-mt-28 sm:mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">From buyers</p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Reviews</h2>
        </div>
        {reviews.length > 0 ? (
          <p className="inline-flex items-center gap-2 text-sm">
            <StarRating value={average} className="h-4 w-4" />
            <span className="nums">
              {average.toFixed(1)} from {reviews.length}
            </span>
          </p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="mt-8 max-w-xl">
        <p className="text-xs text-muted">Your rating</p>
        <div className="mt-2">
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <label className="mt-4 block text-xs text-muted" htmlFor="review-name">
          Name
          <input
            id="review-name"
            className="field mt-1"
            autoComplete="name"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </label>
        <label className="mt-3 block text-xs text-muted" htmlFor="review-body">
          Review
          <textarea
            id="review-body"
            className="field mt-1 min-h-24 resize-y"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-signal">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn-primary mt-4">
          Publish review
        </button>
      </form>

      {reviews.length > 0 ? (
        <ul className="mt-10 divide-y divide-line border-y border-line">
          {reviews.map((review) => (
            <li key={review.id} className="py-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{review.author}</p>
                <p className="text-xs text-muted">{formatReviewDate(review.created_at)}</p>
              </div>
              <div className="mt-2">
                <StarRating value={review.rating} />
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{review.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-muted">No reviews yet.</p>
      )}
    </section>
  );
}
