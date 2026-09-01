"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { UserPlus, Vote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { CourseCombobox } from "@/components/course-combobox";
import { createProfessor } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import type { Course } from "@/lib/types";
import { DEPARTMENT_SUGGESTIONS } from "@/lib/univalle";
import { toast } from "sonner";
import Link from "next/link";

const newProfessorSchema = z.object({
  name: z.string().trim().min(3, "Escribe el nombre completo del profe"),
  // Solo el nombre es obligatorio: pedir más datos frena a quien solo
  // recuerda al profe y no sabe a qué departamento pertenece.
  department: z.string().trim().optional(),
  // Proponer profesor ya no exige materias.
  courses: z.array(z.custom<Course>()),
});

type NewProfessorValues = z.infer<typeof newProfessorSchema>;

export default function NewProfessorPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewProfessorValues>({
    resolver: zodResolver(newProfessorSchema),
    mode: "onBlur",
    defaultValues: { name: "", department: "", courses: [] },
  });

  const mutation = useMutation({
    mutationFn: (values: NewProfessorValues) =>
      createProfessor({
        name: values.name.trim(),
        department: values.department?.trim() || undefined,
        courseIds: values.courses.map((c) => c.id),
      }),
    onSuccess: () => {
      toast.success("¡Listo! Ya quedó postulado, ahora a juntar votos.");
      router.push("/profesores/pendientes");
    },
    onError: () => {
      toast.error("No se pudo enviar. Intenta otra vez.");
    },
  });

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">
          Primero entra a tu cuenta
        </h1>
        <p className="text-muted-foreground">
          Solo estudiantes con sesión activa pueden postular profesores.
        </p>
        <Button className="h-11 cursor-pointer" render={<Link href="/login">Ir a iniciar sesión</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <UserPlus className="size-6" aria-hidden />
        </div>
        <h1 className="font-heading text-4xl font-extrabold text-foreground">
          ¿Falta un profe?
        </h1>
        <p className="mt-2 flex items-start gap-2 text-muted-foreground">
          <Vote className="mt-0.5 size-4 shrink-0 text-primary" />
          Postúlalo. Necesita 3 votos de otros estudiantes (o 1 de un admin)
          para aparecer en el listado.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
        noValidate
      >
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="prof-name">Nombre completo *</FieldLabel>
          <Input
            id="prof-name"
            placeholder="Ej: Ana María Restrepo"
            className="h-11"
            {...register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.department}>
          <FieldLabel htmlFor="prof-department">Departamento (opcional)</FieldLabel>
          <Input
            id="prof-department"
            list="univalle-departments"
            placeholder="Ej: Escuela de Ingeniería de Sistemas y Computación"
            className="h-11"
            {...register("department")}
          />
          {/* Sugerencias reales de la U. Es un datalist, no un select: se
              puede escribir cualquier cosa o dejarlo vacío. */}
          <datalist id="univalle-departments">
            {DEPARTMENT_SUGGESTIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          <FieldError errors={[errors.department]} />
        </Field>

        <Field data-invalid={!!errors.courses}>
          <FieldLabel htmlFor="prof-courses">¿Qué materias dicta? (opcional)</FieldLabel>
          <Controller
            control={control}
            name="courses"
            render={({ field }) => (
              <CourseCombobox
                id="prof-courses"
                selected={field.value}
                onChange={field.onChange}
                multiple
                allowCreate
                placeholder="Busca o crea una materia..."
              />
            )}
          />
          <FieldError errors={[errors.courses]} />
        </Field>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="h-12 w-full cursor-pointer text-base active:scale-[0.98] sm:w-auto sm:self-start"
        >
          {mutation.isPending ? "Enviando..." : "Postular profesor"}
        </Button>
      </form>
    </div>
  );
}
