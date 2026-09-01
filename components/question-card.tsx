"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, MessageCircleQuestion } from "lucide-react";
import { AnswerCard } from "@/components/answer-card";
import { AnswerForm } from "@/components/answer-form";
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
import { ApiError, reportQuestion } from "@/lib/api";
import type { Question } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

function pluralAnswers(count: number) {
  if (count === 0) return "Sin respuestas";
  if (count === 1) return "1 respuesta";
  return `${count} respuestas`;
}

export function QuestionCard({
  question,
  questionsQueryKey,
}: {
  question: Question;
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
      await reportQuestion(question.id, reportReason.trim());
      setReported(true);
      toast.success("Gracias, revisaremos esta pregunta.");
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
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MessageCircleQuestion className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-relaxed text-foreground">
              {question.body}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {question.authorUsername} · {formatDate(question.createdAt)} ·{" "}
              {pluralAnswers(question.answerCount)}
            </p>
          </div>
        </div>

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
              <AlertDialogTitle>Reportar esta pregunta</AlertDialogTitle>
              <AlertDialogDescription>
                Cuéntanos por qué crees que esta pregunta incumple las normas
                de la comunidad (insultos, información falsa, spam). Un
                administrador la revisará.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`report-question-${question.id}`}>Motivo del reporte</Label>
              <Textarea
                id={`report-question-${question.id}`}
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

      <div className="flex flex-col gap-3 border-t border-border pt-4 pl-3 sm:pl-12">
        {question.answers.length > 0 ? (
          <div className="flex flex-col gap-3">
            {question.answers.map((answer) => (
              <AnswerCard key={answer.id} answer={answer} questionsQueryKey={questionsQueryKey} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nadie ha respondido todavía. ¿Le sabes?
          </p>
        )}

        {isAuthenticated ? (
          <AnswerForm
            questionId={question.id}
            questionsQueryKey={questionsQueryKey}
            placeholder={
              question.answers.length === 0
                ? "Cuéntale a esta persona lo que sabes..."
                : "Suma tu respuesta..."
            }
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Inicia sesión
            </Link>{" "}
            para responder.
          </p>
        )}
      </div>
    </article>
  );
}
