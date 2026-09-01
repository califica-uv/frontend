"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ApiError, createQuestion } from "@/lib/api";
import type { Question } from "@/lib/types";
import { toast } from "sonner";

const MAX_LENGTH = 500;

const questionSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Escribe tu pregunta antes de enviarla")
    .max(MAX_LENGTH, `Máximo ${MAX_LENGTH} caracteres`),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  professorId: number;
  questionsQueryKey: unknown[];
}

export function QuestionForm({ professorId, questionsQueryKey }: QuestionFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    mode: "onBlur",
    defaultValues: { body: "" },
  });

  const body = watch("body") ?? "";

  const mutation = useMutation({
    mutationFn: (values: QuestionFormValues) => createQuestion(professorId, values.body.trim()),
    onSuccess: (question) => {
      queryClient.setQueryData<Question[]>(questionsQueryKey, (old) =>
        old ? [question, ...old] : [question]
      );
      toast.success("¡Listo, tu pregunta ya quedó publicada!");
      reset();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.status === 409 && err.code === "USERNAME_REQUIRED") {
        router.push("/bienvenido");
        return;
      }
      toast.error("Se nos cruzaron los cables, no se pudo publicar la pregunta.");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
      noValidate
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HelpCircle className="size-5" aria-hidden />
        </div>
        <div>
          <h3 className="font-heading text-lg font-extrabold text-foreground">
            ¿Tienes una duda sobre este profe?
          </h3>
          <p className="text-sm text-muted-foreground">
            Pregúntale a la comunidad — otros estudiantes que ya vieron la clase
            te pueden sacar de dudas.
          </p>
        </div>
      </div>

      <Field data-invalid={!!errors.body}>
        <FieldLabel htmlFor="question-body" className="sr-only">
          Tu pregunta
        </FieldLabel>
        <Textarea
          id="question-body"
          rows={2}
          maxLength={MAX_LENGTH}
          placeholder="Ej: ¿es exigente con las entregas? ¿sirve ir a las monitorías?"
          {...register("body")}
        />
        <div className="flex items-center justify-end">
          <p className="text-xs text-muted-foreground">
            {body.trim().length}/{MAX_LENGTH}
          </p>
        </div>
        <FieldError errors={[errors.body]} />
      </Field>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="h-11 w-full cursor-pointer active:scale-[0.98] sm:w-auto sm:self-start"
      >
        {mutation.isPending ? "Publicando..." : "Preguntar"}
      </Button>
    </form>
  );
}
