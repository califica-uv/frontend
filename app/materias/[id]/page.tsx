"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfessorCard } from "@/components/professor-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { getCourses, getProfessors } from "@/lib/api";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const courseId = Number(id);

  const courseQuery = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const results = await getCourses();
      return results.find((c) => c.id === courseId) ?? null;
    },
  });

  const professorsQuery = useQuery({
    queryKey: ["professors", { course: courseId, sort: "rating" }],
    queryFn: () => getProfessors({ course: courseId, sort: "rating" }),
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
      <Link
        href="/materias"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Volver a materias
      </Link>

      {courseQuery.isLoading ? (
        <Skeleton className="h-16 w-2/3 rounded-xl" />
      ) : (
        <div>
          <h1 className="font-heading text-4xl font-extrabold text-foreground">
            {courseQuery.data?.name ?? "Materia"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {courseQuery.data?.department ?? "Sin departamento"}
            {courseQuery.data?.code ? ` · Código ${courseQuery.data.code}` : ""}
          </p>
        </div>
      )}

      <div>
        <h2 className="mb-4 font-heading text-2xl font-extrabold text-foreground">
          Profesores que la dictan
        </h2>

        {professorsQuery.isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        )}

        {professorsQuery.isError && (
          <ErrorState onRetry={() => professorsQuery.refetch()} />
        )}

        {!professorsQuery.isLoading &&
          !professorsQuery.isError &&
          (professorsQuery.data?.length ?? 0) === 0 && (
            <EmptyState
              icon={GraduationCap}
              title="Nadie ha contado nada de esta materia"
              description="Postula a un profesor que la dicte y arranca la conversación."
            />
          )}

        {!professorsQuery.isLoading &&
          !professorsQuery.isError &&
          (professorsQuery.data?.length ?? 0) > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {professorsQuery.data!.map((prof) => (
                <ProfessorCard key={prof.id} professor={prof} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
