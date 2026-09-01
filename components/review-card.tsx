"use client";

import { useState } from "react";
import Image from "next/image";
import { Flag, CheckCircle2, XCircle } from "lucide-react";
import { RatingStars } from "@/components/rating-stars";
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
import { reportReview, voteReview } from "@/lib/api";
import type { Review } from "@/lib/types";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function ReviewCard({
  review,
  reviewsQueryKey,
}: {
  review: Review;
  reviewsQueryKey: unknown[];
}) {
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);

  async function handleReport() {
    if (reportReason.trim().length < 10) return;
    setReporting(true);
    try {
      await reportReview(review.id, reportReason.trim());
      setReported(true);
      toast.success("Gracias, revisaremos esta reseña.");
    } catch {
      toast.error("No se pudo enviar el reporte.");
    } finally {
      setReporting(false);
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {review.course && (
            <p className="font-heading text-lg font-extrabold text-foreground">
              {review.course.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {review.authorUsername} · {formatDate(review.createdAt)}
          </p>
        </div>
        <RatingStars value={review.rating} size="sm" />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-muted-foreground">
          Dificultad: <strong className="text-foreground">{review.difficulty}/5</strong>
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {review.wouldTakeAgain ? (
            <>
              <CheckCircle2 className="size-4 text-accent" aria-hidden />
              Volvería a tomar clase con esta persona
            </>
          ) : (
            <>
              <XCircle className="size-4 text-destructive" aria-hidden />
              No volvería a tomar clase con esta persona
            </>
          )}
        </span>
      </div>

      <p className="whitespace-pre-line text-base leading-relaxed text-foreground">
        {review.body}
      </p>

      {review.attachments.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {review.attachments.map((att) => (
            <div
              key={att.id}
              className="relative size-24 overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={att.url}
                alt="Evidencia adjunta a la reseña"
                fill
                sizes="96px"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <VoteButtons<Review[]>
          item={review}
          queryKey={reviewsQueryKey}
          voteFn={voteReview}
          ariaLabel="Votar esta reseña"
          updateCache={(old, id, nextVote) =>
            old?.map((r) => {
              if (r.id !== id) return r;
              let like = r.likeCount;
              let dislike = r.dislikeCount;
              if (r.myVote === 1) like -= 1;
              if (r.myVote === -1) dislike -= 1;
              if (nextVote === 1) like += 1;
              if (nextVote === -1) dislike += 1;
              return { ...r, myVote: nextVote, likeCount: like, dislikeCount: dislike };
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
              <AlertDialogTitle>Reportar esta reseña</AlertDialogTitle>
              <AlertDialogDescription>
                Cuéntanos por qué crees que esta reseña incumple las normas de
                la comunidad (insultos, información falsa, spam). Un
                administrador la revisará.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`report-${review.id}`}>Motivo del reporte</Label>
              <Textarea
                id={`report-${review.id}`}
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
