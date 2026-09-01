"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  outOf?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-5",
  lg: "size-7",
};

export function RatingStars({
  value,
  outOf = 5,
  size = "md",
  interactive = false,
  onChange,
  label,
  className,
}: RatingStarsProps) {
  const stars = Array.from({ length: outOf }, (_, i) => i + 1);

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={label ?? `Calificación: ${value} de ${outOf} estrellas`}
    >
      {stars.map((star) => {
        const filled = star <= Math.round(value);
        if (!interactive) {
          return (
            <Star
              key={star}
              aria-hidden
              className={cn(
                sizeMap[size],
                filled
                  ? "fill-rating text-rating-strong"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} de ${outOf} estrellas`}
            className={cn(
              "flex size-11 cursor-pointer items-center justify-center rounded-md transition-colors duration-200 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            )}
            onClick={() => onChange?.(star)}
          >
            <Star
              className={cn(
                sizeMap[size],
                filled
                  ? "fill-rating text-rating-strong"
                  : "fill-transparent text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
