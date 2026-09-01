import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/60 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-background text-primary">
        <Icon className="size-7" aria-hidden />
      </div>
      <p className="font-heading text-xl font-extrabold text-foreground">{title}</p>
      {description && (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {action}
    </div>
  );
}
