"use client";

import { useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Item votable genérico: reseñas y respuestas comparten esta forma.
export interface VotableItem {
  id: number;
  likeCount: number;
  dislikeCount: number;
  myVote: 1 | -1 | 0;
}

interface VoteButtonsProps<T> {
  item: VotableItem;
  queryKey: unknown[];
  // Llama al endpoint real de voto (reseña o respuesta).
  voteFn: (id: number, value: 1 | -1) => Promise<unknown>;
  // Actualiza la caché de TanStack Query con el voto optimista aplicado.
  updateCache: (old: T | undefined, id: number, nextVote: 1 | -1 | 0) => T | undefined;
  ariaLabel: string;
  disabled?: boolean;
  // Se ejecuta antes de disparar la mutación; si devuelve false, se aborta
  // el voto sin llamar al servidor (p. ej. para invitar a un anónimo a
  // iniciar sesión sin gastar una request).
  onBeforeVote?: () => boolean;
}

function AnimatedCount({ value }: { value: number }) {
  const [bump, setBump] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value) {
      setBump(true);
      prev.current = value;
      const t = setTimeout(() => setBump(false), 220);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className={cn(
        "inline-block tabular-nums transition-transform duration-200",
        bump && "scale-125"
      )}
    >
      {value}
    </span>
  );
}

export function VoteButtons<T>({
  item,
  queryKey,
  voteFn,
  updateCache,
  ariaLabel,
  disabled,
  onBeforeVote,
}: VoteButtonsProps<T>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (value: 1 | -1) => voteFn(item.id, value),
    onMutate: async (value: 1 | -1) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<T>(queryKey);
      const nextVote: 1 | -1 | 0 = item.myVote === value ? 0 : value;

      queryClient.setQueryData<T>(queryKey, (old) => updateCache(old, item.id, nextVote));

      return { previous };
    },
    onError: (_err, _value, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Ey, no se pudo registrar tu voto. Intenta de nuevo.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  function handleVote(value: 1 | -1) {
    if (onBeforeVote && !onBeforeVote()) return;
    mutation.mutate(value);
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={ariaLabel}>
      <button
        type="button"
        disabled={disabled || mutation.isPending}
        aria-pressed={item.myVote === 1}
        onClick={() => handleVote(1)}
        className={cn(
          "flex h-11 min-w-[44px] cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50",
          item.myVote === 1
            ? "border-accent bg-accent/10 text-accent"
            : "border-border text-muted-foreground hover:border-accent hover:text-accent"
        )}
      >
        <ThumbsUp className="size-4" aria-hidden />
        <AnimatedCount value={item.likeCount} />
        <span className="sr-only">útil</span>
      </button>
      <button
        type="button"
        disabled={disabled || mutation.isPending}
        aria-pressed={item.myVote === -1}
        onClick={() => handleVote(-1)}
        className={cn(
          "flex h-11 min-w-[44px] cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-all duration-200 active:scale-90 disabled:cursor-not-allowed disabled:opacity-50",
          item.myVote === -1
            ? "border-downvote bg-downvote/10 text-downvote"
            : "border-border text-muted-foreground hover:border-downvote hover:text-downvote"
        )}
      >
        <ThumbsDown className="size-4" aria-hidden />
        <AnimatedCount value={item.dislikeCount} />
        <span className="sr-only">no útil</span>
      </button>
    </div>
  );
}
