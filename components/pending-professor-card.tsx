"use client";

import { CheckCircle2, ThumbsUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CourseBadges } from "@/components/course-badges";
import { voteProfessor } from "@/lib/api";
import type { PendingProfessor } from "@/lib/types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export function PendingProfessorCard({ professor }: { professor: PendingProfessor }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const pct = Math.min(100, Math.round((professor.voteCount / professor.votesNeeded) * 100));

  const mutation = useMutation({
    mutationFn: () => voteProfessor(professor.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["pendingProfessors"] });
      const previous = queryClient.getQueryData<PendingProfessor[]>(["pendingProfessors"]);
      queryClient.setQueryData<PendingProfessor[]>(["pendingProfessors"], (old) =>
        old?.map((p) =>
          p.id === professor.id
            ? { ...p, voteCount: p.voteCount + 1, hasVoted: true }
            : p
        )
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["pendingProfessors"], context.previous);
      }
      toast.error("Uy, no se pudo registrar tu voto.");
    },
    onSuccess: () => {
      toast.success("¡Voto contado! Gracias por el aporte.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingProfessors"] });
    },
  });

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div>
        <h3 className="font-heading text-xl font-extrabold text-foreground">
          {professor.name}
        </h3>
        <p className="text-sm text-muted-foreground">{professor.department}</p>
      </div>

      <CourseBadges courses={professor.courses} />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {professor.votesNeeded - professor.voteCount <= 0
              ? "¡Ya casi sale!"
              : `Ya casi, falta${professor.votesNeeded - professor.voteCount === 1 ? "" : "n"} ${
                  professor.votesNeeded - professor.voteCount
                } voto${professor.votesNeeded - professor.voteCount === 1 ? "" : "s"}`}
          </span>
          <span className="font-semibold text-foreground">
            {professor.voteCount}/{professor.votesNeeded}
          </span>
        </div>
        <Progress value={pct} className="h-2.5" />
      </div>

      <Button
        onClick={() => mutation.mutate()}
        disabled={!isAuthenticated || professor.hasVoted || mutation.isPending}
        className="h-11 cursor-pointer gap-2 active:scale-[0.97]"
        variant={professor.hasVoted ? "secondary" : "default"}
      >
        {professor.hasVoted ? (
          <>
            <CheckCircle2 className="size-4" /> Ya le diste voto
          </>
        ) : (
          <>
            <ThumbsUp className="size-4" /> Darle mi voto
          </>
        )}
      </Button>
      {!isAuthenticated && (
        <p className="text-xs text-muted-foreground">
          Entra con tu correo institucional para poder votar.
        </p>
      )}
    </div>
  );
}
