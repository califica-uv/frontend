import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { RatingStars } from "@/components/rating-stars";
import { CourseBadges } from "@/components/course-badges";
import type { Professor } from "@/lib/types";

export function ProfessorCard({ professor }: { professor: Professor }) {
  return (
    <Link
      href={`/profesores/${professor.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-extrabold text-foreground transition-colors duration-200 group-hover:text-primary">
            {professor.name}
          </h3>
          <p className="text-sm text-muted-foreground">{professor.department}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <RatingStars value={professor.averageRating} size="sm" />
          <span className="text-sm font-semibold text-rating-strong">
            {professor.averageRating.toFixed(1)}
          </span>
        </div>
      </div>

      <CourseBadges courses={professor.courses} />

      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MessageSquare className="size-4" aria-hidden />
        {professor.reviewCount}{" "}
        {professor.reviewCount === 1 ? "reseña" : "reseñas"}
      </div>
    </Link>
  );
}
