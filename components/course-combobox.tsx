"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createCourse, getCourses } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Course } from "@/lib/types";

interface CourseComboboxProps {
  selected: Course[];
  onChange: (courses: Course[]) => void;
  multiple?: boolean;
  allowCreate?: boolean;
  placeholder?: string;
  id?: string;
}

// Combobox libre: escribes, ves sugerencias de materias ya existentes,
// eliges una o creas la tuya. La creación llama de verdad a POST /courses,
// que en el backend es idempotente (dedupe por nombre normalizado), así que
// nunca duplicamos "Cálculo I" / "calculo 1" / "CALCULO I".
export function CourseCombobox({
  selected,
  onChange,
  multiple = true,
  allowCreate = true,
  placeholder = "Busca una materia...",
  id,
}: CourseComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", debouncedQuery],
    queryFn: () => getCourses(debouncedQuery),
  });

  const createMutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onChange(multiple ? [...selected, course] : [course]);
      setQuery("");
      if (!multiple) setOpen(false);
    },
  });

  const selectedIds = new Set(selected.map((c) => c.id));

  function toggleCourse(course: Course) {
    if (selectedIds.has(course.id)) {
      onChange(selected.filter((c) => c.id !== course.id));
    } else {
      onChange(multiple ? [...selected, course] : [course]);
      if (!multiple) setOpen(false);
    }
  }

  function createAndSelect() {
    const name = query.trim();
    if (!name) return;
    createMutation.mutate({ name });
  }

  const exactMatch = courses.some(
    (c) => c.name.trim().toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-11 w-full cursor-pointer justify-between font-normal"
            >
              {placeholder}
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          }
        />
        {/* Base UI expone --anchor-width en el Positioner; --radix-* no existe
            aquí y dejaba el panel sin ancho. min-w sirve de respaldo. */}
        <PopoverContent
          className="w-[var(--anchor-width)] min-w-72 p-0"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Escribe el nombre de la materia..."
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {isLoading && <CommandEmpty>Buscando...</CommandEmpty>}
              {!isLoading && courses.length === 0 && (
                <CommandEmpty>No se encontraron materias.</CommandEmpty>
              )}
              <CommandGroup>
                {courses.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={String(course.id)}
                    onSelect={() => toggleCourse(course)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedIds.has(course.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-medium">{course.name}</span>
                    {course.code && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {course.code}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {allowCreate && query.trim().length > 1 && !exactMatch && (
                <CommandGroup>
                  <CommandItem
                    onSelect={createAndSelect}
                    disabled={createMutation.isPending}
                    className="cursor-pointer text-accent"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 size-4" />
                    )}
                    Usar &ldquo;{query.trim()}&rdquo;
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((course) => (
            <Badge key={course.id} variant="secondary" className="gap-1.5 py-1.5 pl-3 pr-2 text-sm">
              {course.name}
              <button
                type="button"
                aria-label={`Quitar ${course.name}`}
                onClick={() => toggleCourse(course)}
                className="flex size-5 cursor-pointer items-center justify-center rounded-full hover:bg-background/60"
              >
                <X className="size-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
