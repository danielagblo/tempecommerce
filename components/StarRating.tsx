"use client";

import { Star } from "lucide-react";

function StarGlyph({ amount, className }: { amount: number; className: string }) {
  const fill = Math.max(0, Math.min(1, amount));
  return (
    <span className={`relative inline-block ${className}`}>
      <Star className="h-full w-full text-line" strokeWidth={1.5} aria-hidden />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <Star
          className={`absolute left-0 top-0 max-w-none ${className} fill-ink text-ink`}
          strokeWidth={1.5}
          aria-hidden
        />
      </span>
    </span>
  );
}

export function StarRating({
  value,
  className = "h-3.5 w-3.5",
}: {
  value: number;
  className?: string;
}) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rounded} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarGlyph key={star} amount={rounded - (star - 1)} className={className} />
      ))}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = value >= star;
        return (
          <button
            key={star}
            type="button"
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            aria-pressed={value === star}
            onClick={() => onChange(star)}
            className="rounded-full p-0.5 hover:opacity-70"
          >
            <Star
              className={`h-5 w-5 ${selected ? "fill-ink text-ink" : "text-line"}`}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </span>
  );
}
