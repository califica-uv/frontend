"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MessageCircleQuestion, MessageSquareOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/rating-stars";
import { RatingBreakdown } from "@/components/rating-breakdown";
import { CourseBadges } from "@/components/course-badges";
import { ReviewCard } from "@/components/review-card";
import { ReviewForm } from "@/components/review-form";
import { QuestionCard } from "@/components/question-card";
import { QuestionForm } from "@/components/question-form";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProfessorBySlug, getProfessorQuestions, getProfessorReviews } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Course } from "@/lib/types";

export default function ProfessorDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { isAuthenticated } = useAuth();
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  const professorQuery = useQuery({
    queryKey: ["professor", slug],
    queryFn: () => getProfessorBySlug(slug),
  });

  const reviewsQueryKey = ["reviews", professorQuery.data?.id, activeCourse?.id ?? null];

  const reviewsQuery = useQuery({
    queryKey: reviewsQueryKey,
    queryFn: () => getProfessorReviews(professorQuery.data!.id, activeCourse?.id),
    enabled: !!professorQuery.data,
  });

  const questionsQueryKey = ["questions", professorQuery.data?.id];

  const questionsQuery = useQuery({
    queryKey: questionsQueryKey,
    queryFn: () => getProfessorQuestions(professorQuery.data!.id),
    enabled: !!professorQuery.data,
  });

  if (professorQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="mt-6 h-64 rounded-2xl" />
      </div>
    );
  }

  if (professorQuery.isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <ErrorState onRetry={() => professorQuery.refetch()} />
      </div>
    );
  }

  const professor = professorQuery.data;

  if (!professor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">
          No encontramos este profesor
        </h1>
        <Link href="/profesores" className="mt-4 inline-block text-primary hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6">
      <Link
        href="/profesores"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Volver a profesores
      </Link>

      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-extrabold text-foreground">
              {professor.name}
            </h1>
            <p className="mt-1 text-muted-foreground">{professor.department}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <RatingStars value={professor.averageRating} size="lg" />
            <span className="font-heading text-2xl font-extrabold text-rating-strong">
              {professor.averageRating.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">
              {professor.reviewCount} reseñas
            </span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Materias que dicta{" "}
            <span className="font-normal text-muted-foreground">
              (haz clic para filtrar las reseñas)
            </span>
          </p>
          <CourseBadges
            courses={professor.courses}
            activeCourseId={activeCourse?.id}
            onSelect={setActiveCourse}
          />
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-3 font-heading text-xl font-extrabold text-foreground">
              Distribución de calificaciones
            </h2>
            <RatingBreakdown breakdown={professor.ratingBreakdown} />
          </div>
          <div>
            <h2 className="mb-3 font-heading text-xl font-extrabold text-foreground">
              Promedio por materia
            </h2>
            {(professor.ratingByCourse?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay reseñas con materia para promediar.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {professor.ratingByCourse?.map((ca) => (
                  <li key={ca.course.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-foreground">{ca.course.name}</span>
                    <span className="flex items-center gap-2">
                      <RatingStars value={ca.averageRating} size="sm" />
                      <span className="text-sm font-semibold text-rating-strong">
                        {ca.averageRating.toFixed(1)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="reseñas" className="w-full">
        <TabsList className="h-11 w-full sm:w-fit">
          <TabsTrigger value="reseñas" className="cursor-pointer px-4">
            Reseñas
          </TabsTrigger>
          <TabsTrigger value="preguntas" className="cursor-pointer px-4">
            Preguntas {questionsQuery.data?.length ? `(${questionsQuery.data.length})` : ""}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reseñas" className="mt-6 flex flex-col gap-8">
          {isAuthenticated && (
            <ReviewForm professorId={professor.id} reviewsQueryKey={reviewsQueryKey} />
          )}
          {!isAuthenticated && (
            <div className="rounded-2xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>{" "}
              con tu correo institucional para dejar una reseña.
            </div>
          )}

          <div className="flex flex-col gap-6">
            <h2 className="font-heading text-2xl font-extrabold text-foreground">
              Reseñas {activeCourse ? `· ${activeCourse.name}` : ""}
            </h2>

            {reviewsQuery.isLoading && (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            )}

            {reviewsQuery.isError && <ErrorState onRetry={() => reviewsQuery.refetch()} />}

            {!reviewsQuery.isLoading &&
              !reviewsQuery.isError &&
              (reviewsQuery.data?.length ?? 0) === 0 && (
                <EmptyState
                  icon={MessageSquareOff}
                  title="Todavía nadie ha hablado de este profe"
                  description="Sé el primero en contar cómo es la clase de verdad."
                />
              )}

            {!reviewsQuery.isLoading &&
              !reviewsQuery.isError &&
              (reviewsQuery.data?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-4">
                  {reviewsQuery.data!.map((review) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      reviewsQueryKey={reviewsQueryKey}
                    />
                  ))}
                </div>
              )}
          </div>
        </TabsContent>

        <TabsContent value="preguntas" className="mt-6 flex flex-col gap-8">
          {isAuthenticated ? (
            <QuestionForm professorId={professor.id} questionsQueryKey={questionsQueryKey} />
          ) : (
            <div className="rounded-2xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>{" "}
              con tu correo institucional para preguntarle algo a la comunidad.
            </div>
          )}

          <div className="flex flex-col gap-6">
            <h2 className="font-heading text-2xl font-extrabold text-foreground">
              Preguntas
            </h2>

            {questionsQuery.isLoading && (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-2xl" />
                ))}
              </div>
            )}

            {questionsQuery.isError && <ErrorState onRetry={() => questionsQuery.refetch()} />}

            {!questionsQuery.isLoading &&
              !questionsQuery.isError &&
              (questionsQuery.data?.length ?? 0) === 0 && (
                <EmptyState
                  icon={MessageCircleQuestion}
                  title="Nadie le ha preguntado nada a este profe"
                  description="Anímate a hacer la primera pregunta, seguro no eres el único con esa duda."
                />
              )}

            {!questionsQuery.isLoading &&
              !questionsQuery.isError &&
              (questionsQuery.data?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-4">
                  {questionsQuery.data!.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      questionsQueryKey={questionsQueryKey}
                    />
                  ))}
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
