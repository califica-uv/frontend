"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

interface CourseBadgesProps {
  courses: Course[];
  activeCourseId?: number | null;
  onSelect?: (course: Course | null) => void;
  className?: string;
}

export function CourseBadges({
  courses,
  activeCourseId,
  onSelect,
  className,
}: CourseBadgesProps) {
  const clickable = !!onSelect;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {courses.map((course) => {
        const active = activeCourseId === course.id;
        return (
          <Badge
            key={course.id}
            variant={active ? "default" : "secondary"}
            onClick={clickable ? () => onSelect?.(active ? null : course) : undefined}
            className={cn(
              "min-h-[32px] px-3 py-1.5 text-sm font-medium",
              clickable &&
                "cursor-pointer transition-colors duration-200 hover:bg-primary hover:text-primary-foreground"
            )}
            title={course.name}
          >
            {course.name}
          </Badge>
        );
      })}
    </div>
  );
}
