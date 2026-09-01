"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useDebounce } from "@/hooks/use-debounce";
import { getCourses } from "@/lib/api";

export default function CoursesPage() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["courses-page", debouncedQ],
    queryFn: () => getCourses(debouncedQ || undefined),
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-heading text-4xl font-extrabold text-foreground">Materias</h1>
        <p className="mt-2 text-muted-foreground">
          Explora las materias con reseñas y encuentra quién las dicta mejor.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar materia por nombre o código..."
          aria-label="Buscar materia"
          className="h-11 pl-9"
        />
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No hay materias con eso"
          description="Prueba con otro nombre o código, o de una vez postula al profe que la dicta."
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((course) => (
            <Link
              key={course.id}
              href={`/materias/${course.id}`}
              className="group flex flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <span className="font-heading text-lg font-extrabold text-foreground transition-colors duration-200 group-hover:text-primary">
                {course.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {[course.code, course.department].filter(Boolean).join(" · ") || "Sin más datos aún"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
