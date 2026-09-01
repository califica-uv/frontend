"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfessorCard } from "@/components/professor-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useDebounce } from "@/hooks/use-debounce";
import { getProfessors } from "@/lib/api";
import { DEPARTMENT_SUGGESTIONS } from "@/lib/univalle";

// Antes salían de los mocks, así que en producción el filtro ofrecía
// departamentos inventados. Ahora usa las unidades académicas reales de la U.
const departments = DEPARTMENT_SUGGESTIONS;

function ProfessorsPageInner() {
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [department, setDepartment] = useState<string>("all");
  const [sort, setSort] = useState<"rating" | "reviews" | "name">("rating");
  const debouncedQ = useDebounce(q, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["professors", { q: debouncedQ, department, sort }],
    queryFn: () =>
      getProfessors({
        q: debouncedQ || undefined,
        department: department === "all" ? undefined : department,
        sort,
      }),
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-heading text-4xl font-extrabold text-foreground">Profesores</h1>
        <p className="mt-2 text-muted-foreground">
          Encuentra reseñas honestas antes de matricular tu próxima clase.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre..."
            aria-label="Buscar profesor por nombre"
            className="h-11 pl-9"
          />
        </div>
        <Select value={department} onValueChange={(v) => setDepartment(v ?? "all")}>
          <SelectTrigger className="h-11 w-full sm:w-56" aria-label="Filtrar por departamento">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-11 w-full sm:w-48" aria-label="Ordenar por">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Mejor calificados</SelectItem>
            <SelectItem value="reviews">Más reseñados</SelectItem>
            <SelectItem value="name">Nombre (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && <ErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (data?.length ?? 0) === 0 && (
        <EmptyState
          icon={GraduationCap}
          title="Nada por aquí con esos filtros"
          description="Prueba con otro nombre o departamento, o postula al profesor que buscas."
        />
      )}

      {!isLoading && !isError && (data?.length ?? 0) > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data!.map((prof) => (
            <ProfessorCard key={prof.id} professor={prof} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfessorsPage() {
  return (
    <Suspense>
      <ProfessorsPageInner />
    </Suspense>
  );
}
