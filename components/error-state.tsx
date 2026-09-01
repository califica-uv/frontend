"use client";

import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Algo salió mal",
  description = "No pudimos cargar la información. Inténtalo de nuevo en unos segundos.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-background text-destructive">
        <AlertTriangle className="size-7" aria-hidden />
      </div>
      <p className="font-heading text-xl font-extrabold text-foreground">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-2 h-11 cursor-pointer gap-2">
          <RotateCw className="size-4" /> Reintentar
        </Button>
      )}
    </div>
  );
}
