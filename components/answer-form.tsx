"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field";
import { ApiError, createAnswer } from "@/lib/api";
import type { Question } from "@/lib/types";
import { toast } from "sonner";

const MAX_LENGTH = 2000;

const answerSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Escribe algo antes de responder")
    .max(MAX_LENGTH, `Máximo ${MAX_LENGTH} caracteres`),
});

type AnswerFormValues = z.infer<typeof answerSchema>;

interface AnswerFormProps {
  questionId: number;
  questionsQueryKey: unknown[];
  placeholder?: string;
}

export function AnswerForm({ questionId, questionsQueryKey, placeholder }: AnswerFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnswerFormValues>({
    resolver: zodResolver(answerSchema),
    mode: "onBlur",
    defaultValues: { body: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: AnswerFormValues) => createAnswer(questionId, values.body.trim()),
    onSuccess: (answer) => {
      queryClient.setQueryData<Question[]>(questionsQueryKey, (old) =>
        old?.map((q) =>
          q.id === questionId
            ? { ...q, answerCount: q.answerCount + 1, answers: [...q.answers, answer] }
            : q
        )
      );
      toast.success("Tu respuesta ya quedó publicada.");
      reset();
      setExpanded(false);
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 409 && err.code === "USERNAME_REQUIRED") {
        router.push("/bienvenido");
        return;
      }
      toast.error("No se pudo publicar tu respuesta. Intenta de nuevo.");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-2"
      noValidate
    >
      <Textarea
        rows={expanded ? 3 : 1}
        maxLength={MAX_LENGTH}
        placeholder={placeholder ?? "Escribe una respuesta..."}
        aria-label="Tu respuesta"
        onFocus={() => setExpanded(true)}
        className="min-h-11 resize-none transition-[min-height] duration-200"
        {...register("body")}
      />
      <FieldError errors={[errors.body]} />
      {expanded && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 cursor-pointer"
            onClick={() => {
              reset();
              setExpanded(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={mutation.isPending}
            className="h-9 cursor-pointer active:scale-[0.98]"
          >
            {mutation.isPending ? "Enviando..." : "Responder"}
          </Button>
        </div>
      )}
    </form>
  );
}
