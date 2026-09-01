"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Vote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PendingProfessorCard } from "@/components/pending-professor-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { getPendingProfessors } from "@/lib/api";

export default function PendingProfessorsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pendingProfessors"],
    queryFn: getPendingProfessors,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-extrabold text-foreground">
            Propuestas por votar
          </h1>
          <p className="mt-2 flex items-center gap-2 text-muted-foreground">
            <Vote className="size-4 text-primary" />
            Cada profesor necesita 3 votos de estudiantes para publicarse.
          </p>
        </div>
        <Button
          variant="outline"
          className="h-11 cursor-pointer gap-2"
          render={
            <Link href="/profesores/nuevo">
              <UserPlus className="size-4" /> Proponer otro profesor
            </Link>
          }
        />
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={Vote}
          title="Aquí no hay nadie esperando votos"
          description="Todo lo que se propuso ya salió publicado. ¿Se te quedó algún profe por fuera?"
          action={
            <Button
              className="mt-2 h-11 cursor-pointer"
              render={<Link href="/profesores/nuevo">Proponer profesor</Link>}
            />
          }
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="grid gap-6 sm:grid-cols-2">
          {data!.map((prof) => (
            <PendingProfessorCard key={prof.id} professor={prof} />
          ))}
        </div>
      )}
    </div>
  );
}
