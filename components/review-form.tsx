"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, HeartHandshake, ShieldCheck, XCircle } from "lucide-react";
import { RatingStars } from "@/components/rating-stars";
import { CourseCombobox } from "@/components/course-combobox";
import { ImageUploader, type UploadedImage } from "@/components/image-uploader";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { createReview } from "@/lib/api";
import type { Course, Review } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const MIN_LENGTH = 80;

const reviewSchema = z.object({
  // La materia es opcional: funciona como título libre de la reseña.
  course: z.custom<Course>().nullable(),
  rating: z.number().min(1, "Ponle una calificación").max(5),
  difficulty: z.number().min(1, "¿Qué tan durs fue?").max(5),
  wouldTakeAgain: z.boolean({ error: "Cuéntanos si repetirías" }),
  body: z
    .string()
    .trim()
    .min(MIN_LENGTH, `Escribe al menos ${MIN_LENGTH} caracteres, danos contexto`),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  professorId: number;
  reviewsQueryKey: unknown[];
  onSubmitted?: (review: Review) => void;
}

export function ReviewForm({
  professorId,
  reviewsQueryKey,
  onSubmitted,
}: ReviewFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<UploadedImage[]>([]);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    mode: "onBlur",
    defaultValues: {
      course: null,
      rating: 0,
      difficulty: 0,
      wouldTakeAgain: undefined,
      body: "",
    },
  });

  const body = watch("body") ?? "";

  const mutation = useMutation({
    mutationFn: (values: ReviewFormValues) =>
      createReview(professorId, {
        courseId: values.course?.id ?? null,
        rating: values.rating,
        difficulty: values.difficulty,
        wouldTakeAgain: values.wouldTakeAgain,
        body: values.body.trim(),
        attachmentKeys: images.map((i) => i.key),
      }),
    onSuccess: (review) => {
      queryClient.setQueryData<Review[]>(reviewsQueryKey, (old) =>
        old ? [review, ...old] : [review]
      );
      queryClient.invalidateQueries({ queryKey: ["professor"] });
      toast.success("¡Quedó publicada! Gracias por contar tu experiencia.");
      reset();
      setImages([]);
      onSubmitted?.(review);
    },
    onError: () => {
      toast.error("Se nos cruzaron los cables, no se pudo publicar. Intenta de nuevo.");
    },
  });

  const charCount = body.trim().length;
  const meetsMin = charCount >= MIN_LENGTH;

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
      noValidate
    >
      <div>
        <h3 className="font-heading text-2xl font-extrabold text-foreground">
          Cuenta cómo te fue
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Esto le sirve a otro parcero para escoger su clase, no es para
          desahogarse. Sé específico y ojalá útil.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-4">
        <HeartHandshake className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
        <p className="text-sm text-foreground">
          Cuenta cómo fue la clase de verdad — lo bueno y lo malo. Habla de
          metodología, exigencia, tips. Pero sin bajezas, que al otro lado hay
          una persona. Las reseñas que solo insultan las puede borrar un admin.
        </p>
      </div>

      <Field data-invalid={!!errors.course}>
        <FieldLabel htmlFor="course-combobox">Título de la reseña</FieldLabel>
        <Controller
          control={control}
          name="course"
          render={({ field }) => (
            <CourseCombobox
              id="course-combobox"
              selected={field.value ? [field.value] : []}
              onChange={(courses) => field.onChange(courses[0] ?? null)}
              multiple={false}
              allowCreate
              placeholder="¿Qué materia? (opcional)"
            />
          )}
        />
        <FieldError errors={[errors.course]} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field data-invalid={!!errors.rating}>
          <FieldLabel>¿Cómo lo calificas? *</FieldLabel>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <RatingStars
                value={field.value}
                interactive
                onChange={field.onChange}
                label="Calificación general"
              />
            )}
          />
          <FieldError errors={[errors.rating]} />
        </Field>
        <Field data-invalid={!!errors.difficulty}>
          <FieldLabel>¿Qué tan duro es el curso? *</FieldLabel>
          <Controller
            control={control}
            name="difficulty"
            render={({ field }) => (
              <RatingStars
                value={field.value}
                interactive
                onChange={field.onChange}
                label="Dificultad del curso"
              />
            )}
          />
          <FieldError errors={[errors.difficulty]} />
        </Field>
      </div>

      <Controller
        control={control}
        name="wouldTakeAgain"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-foreground">
              ¿Te lo volverías a montar? *
            </legend>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => field.onChange(true)}
                aria-pressed={field.value === true}
                className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95 ${
                  field.value === true
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:border-accent"
                }`}
              >
                <CheckCircle2 className="size-4" /> De una
              </button>
              <button
                type="button"
                onClick={() => field.onChange(false)}
                aria-pressed={field.value === false}
                className={`flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all duration-200 active:scale-95 ${
                  field.value === false
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground hover:border-destructive"
                }`}
              >
                <XCircle className="size-4" /> Ni de fundas
              </button>
            </div>
            <FieldError errors={[errors.wouldTakeAgain]} />
          </fieldset>
        )}
      />

      <Field data-invalid={!!errors.body}>
        <FieldLabel htmlFor="review-body">Tu reseña *</FieldLabel>
        <Textarea
          id="review-body"
          rows={6}
          placeholder="Ej: evalúa con tres parciales y un proyecto final. Explica con ejemplos de la vida real y responde dudas por correo el mismo día..."
          aria-describedby="review-body-counter"
          {...register("body")}
        />
        <div className="flex items-center justify-between">
          <p
            id="review-body-counter"
            className={`text-sm ${meetsMin ? "text-accent" : "text-muted-foreground"}`}
          >
            {charCount}/{MIN_LENGTH} caracteres mínimos
          </p>
        </div>
        <FieldError errors={[errors.body]} />
      </Field>

      <div className="flex flex-col gap-2">
        <FieldLabel>Evidencia (si tienes)</FieldLabel>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
        Vas a firmar esto como{" "}
        <strong className="text-foreground">{user?.username ?? "tu seudónimo"}</strong>.
        Tu nombre real y tu correo nunca aparecen.
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="h-12 w-full cursor-pointer text-base active:scale-[0.98] sm:w-auto sm:self-start"
      >
        {mutation.isPending ? "Publicando..." : "Publicar reseña"}
      </Button>
    </form>
  );
}
