"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookMarked, Search, ShieldCheck, Sparkles, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfessorCard } from "@/components/professor-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { getProfessors } from "@/lib/api";

const steps = [
  {
    icon: Search,
    title: "Busca a tu profe",
    description: "Filtra por materia o departamento y lee lo que otros parceros ya vivieron con él o ella.",
  },
  {
    icon: Users2,
    title: "¿No está? Lo metes tú",
    description: "Postúlalo con sus materias. Sale publicado apenas junte 3 votos de otros estudiantes.",
  },
  {
    icon: ShieldCheck,
    title: "Habla sin miedo",
    description: "Firmas con un alias. Ni tus panas ni el admin ven tu correo o tu nombre real, palabra.",
  },
];

export default function HomePage() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["professors", { sort: "rating" }],
    queryFn: () => getProfessors({ sort: "rating" }),
  });

  const topProfessors = (data ?? []).slice(0, 6);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q.trim() ? `/profesores?q=${encodeURIComponent(q.trim())}` : "/profesores");
  }

  return (
    <div className="flex flex-col">
      <section className="border-b border-border bg-gradient-to-b from-secondary/20 to-background px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" /> Hecho por y para estudiantes de la U
          </span>
          <h1 className="font-heading text-4xl font-extrabold text-foreground sm:text-6xl">
            ¿Quién te dio esa clase? Aquí te lo cuentan sin filtro
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Reseñas anónimas de profes de la Univalle, escritas por
            estudiantes de verdad. Chismecito académico, con anonimato de
            verdad.
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-xl gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca por nombre de profesor..."
              aria-label="Buscar profesor"
              className="h-12 flex-1 text-base"
            />
            <Button type="submit" className="h-12 cursor-pointer px-6">
              <Search className="size-4" /> Buscar
            </Button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              className="h-11 cursor-pointer gap-2"
              render={
                <Link href="/profesores/nuevo">
                  <BookMarked className="size-4" /> Meter un profe
                </Link>
              }
            />
            <Button
              variant="ghost"
              className="h-11 cursor-pointer"
              render={<Link href="/profesores/pendientes">Ver postulados por votar</Link>}
            />
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
              Mejor calificados
            </h2>
            <Link
              href="/profesores"
              className="text-sm font-medium text-primary transition-colors duration-200 hover:text-secondary"
            >
              Ver todos los profesores →
            </Link>
          </div>

          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          )}

          {isError && <ErrorState onRetry={() => refetch()} />}

          {!isLoading && !isError && topProfessors.length === 0 && (
            <EmptyState
              icon={Users2}
              title="Esto está muy solo todavía"
              description="Sé el primero en postular a un profe de la UV."
              action={
                <Button
                  className="mt-2 h-11 cursor-pointer"
                  render={<Link href="/profesores/nuevo">Proponer profesor</Link>}
                />
              }
            />
          )}

          {!isLoading && !isError && topProfessors.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topProfessors.map((prof) => (
                <ProfessorCard key={prof.id} professor={prof} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-12">
          <h2 className="font-heading text-3xl font-extrabold text-foreground sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-sm">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <step.icon className="size-6" aria-hidden />
                </div>
                <h3 className="font-heading text-xl font-extrabold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
