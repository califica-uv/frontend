import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface RatingBreakdownProps {
  // El backend manda las claves como texto ("1".."5"); indexar con número
  // funciona igual en JS. Se acepta undefined para no reventar si la API
  // todavía no envía el campo.
  breakdown?: Record<string, number>;
}

export function RatingBreakdown({ breakdown }: RatingBreakdownProps) {
  const counts = breakdown ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex flex-col gap-2" aria-label="Distribución de calificaciones">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = counts[star] ?? 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={star} className="flex items-center gap-3">
            <span className="flex w-10 shrink-0 items-center gap-1 text-sm font-medium text-rating-strong">
              {star} <Star className="size-3.5 fill-rating text-rating-strong" aria-hidden />
            </span>
            <Progress
              value={pct}
              className="h-2.5 flex-1 [&_[data-slot=progress-indicator]]:bg-rating"
              aria-hidden
            />
            <span className="w-10 shrink-0 text-right text-sm text-muted-foreground">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
