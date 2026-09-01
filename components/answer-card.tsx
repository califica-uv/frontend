"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import { VoteButtons } from "@/components/vote-buttons";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ApiError, reportAnswer, voteAnswer } from "@/lib/api";
import type { Answer, Question } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function AnswerCard({
  answer,
  questionsQueryKey,
}: {
  answer: Answer;
  questionsQueryKey: unknown[];
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  async function handleReport() {
    if (reportReason.trim().length < 10) return;
    setReporting(true);
    try {
      await reportAnswer(answer.id, reportReason.trim());
      setReported(true);
      toast.success("Gracias, revisaremos esta respuesta.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.code === "USERNAME_REQUIRED") {
        router.push("/bienvenido");
        return;
      }
      toast.error("No se pudo enviar el reporte.");
    } finally {
      setReporting(false);
    }
  }

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {answer.authorUsername} · {formatDate(answer.createdAt)}
        </p>
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
        {answer.body}
      </p>

      <div className="flex items-center justify-between gap-3 pt-1">
        <VoteButtons<Question[]>
          item={answer}
          queryKey={questionsQueryKey}
          voteFn={voteAnswer}
          ariaLabel="Votar esta respuesta"
          onBeforeVote={() => {
            if (!isAuthenticated) {
              toast.error("Inicia sesión para votar respuestas.", {
                action: { label: "Entrar", onClick: () => router.push("/login") },
              });
              return false;
            }
            return true;
          }}
          updateCache={(old, id, nextVote) =>
            old?.map((q) => {
              if (q.id !== answer.questionId) return q;
              return {
                ...q,
                answers: q.answers.map((a) => {
                  if (a.id !== id) return a;
                  let like = a.likeCount;
                  let dislike = a.dislikeCount;
                  if (a.myVote === 1) like -= 1;
                  if (a.myVote === -1) dislike -= 1;
                  if (nextVote === 1) like += 1;
                  if (nextVote === -1) dislike += 1;
                  return { ...a, myVote: nextVote, likeCount: like, dislikeCount: dislike };
                }),
              };
            })
          }
        />

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                disabled={reported}
                className="h-11 cursor-pointer gap-1.5 text-muted-foreground hover:text-destructive"
              >
                <Flag className="size-4" aria-hidden />
                {reported ? "Reportado" : "Reportar"}
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reportar esta respuesta</AlertDialogTitle>
              <AlertDialogDescription>
                Cuéntanos por qué crees que esta respuesta incumple las normas
                de la comunidad (insultos, información falsa, spam). Un
                administrador la revisará.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`report-answer-${answer.id}`}>Motivo del reporte</Label>
              <Textarea
                id={`report-answer-${answer.id}`}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe el problema con al menos 10 caracteres"
                minLength={10}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer"
                disabled={reportReason.trim().length < 10 || reporting}
                onClick={handleReport}
              >
                Enviar reporte
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </article>
  );
}
