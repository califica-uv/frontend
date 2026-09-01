"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, Flag, ScrollText, ShieldAlert, Trash2, Users2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { useAuth } from "@/hooks/use-auth";
import {
  adminBanUser,
  adminDeleteProfessor,
  adminDeleteReview,
  getAdminReports,
  getAuditLog,
  getProfessors,
} from "@/lib/api";
import { toast } from "sonner";

function DeleteDialog({
  triggerLabel,
  title,
  description,
  onConfirm,
}: {
  triggerLabel: string;
  title: string;
  description: string;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <AlertDialog onOpenChange={(open) => !open && setReason("")}>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm" className="h-11 cursor-pointer gap-1.5">
            <Trash2 className="size-4" /> {triggerLabel}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="delete-reason">Motivo del borrado *</Label>
          <Textarea
            id="delete-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explica por qué se borra este contenido (queda en el registro de auditoría)"
            minLength={10}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={reason.trim().length < 10}
            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onConfirm(reason.trim())}
          >
            Confirmar borrado
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BanUserPanel() {
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState("");

  const banMutation = useMutation({
    mutationFn: () => adminBanUser(username.trim(), reason.trim()),
    onSuccess: () => {
      toast.success(`Usuario "${username.trim()}" baneado.`);
      setUsername("");
      setReason("");
    },
    onError: () => toast.error("No se pudo banear al usuario."),
  });

  const canSubmit = username.trim().length > 0 && reason.trim().length >= 10;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">
        El baneo opera por seudónimo (username), no por id: es lo que preserva
        el anonimato. Esta acción también queda en el log de auditoría.
      </p>

      <Field>
        <FieldLabel htmlFor="ban-username">Seudónimo a banear *</FieldLabel>
        <Input
          id="ban-username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ej: gato_curioso42"
          className="h-11"
        />
      </Field>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ban-reason">Motivo del baneo *</Label>
        <Textarea
          id="ban-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explica por qué se banea a este usuario (mínimo 10 caracteres)"
          minLength={10}
        />
      </div>

      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="destructive"
              disabled={!canSubmit}
              className="h-11 w-fit cursor-pointer gap-1.5"
            >
              <Ban className="size-4" /> Banear usuario
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Banear a &ldquo;{username.trim()}&rdquo;</AlertDialogTitle>
            <AlertDialogDescription>
              Este usuario no podrá volver a publicar reseñas ni votar. Queda
              registrado en el log de auditoría.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canSubmit || banMutation.isPending}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => banMutation.mutate()}
            >
              Confirmar baneo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ["admin-reports"],
    queryFn: getAdminReports,
    enabled: isAdmin,
  });

  const professorsQuery = useQuery({
    queryKey: ["professors", {}],
    queryFn: () => getProfessors(),
    enabled: isAdmin,
  });

  const auditQuery = useQuery({
    queryKey: ["admin-audit"],
    queryFn: getAuditLog,
    enabled: isAdmin,
  });

  const deleteReviewMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminDeleteReview(id, reason),
    onSuccess: () => {
      toast.success("Reseña borrada y registrada en auditoría.");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
    },
    onError: () => toast.error("No se pudo borrar la reseña."),
  });

  const deleteProfessorMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminDeleteProfessor(id, reason),
    onSuccess: () => {
      toast.success("Profesor borrado y registrado en auditoría.");
      queryClient.invalidateQueries({ queryKey: ["professors", {}] });
      queryClient.invalidateQueries({ queryKey: ["admin-audit"] });
    },
    onError: () => toast.error("No se pudo borrar el profesor."),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <ShieldAlert className="size-12 text-destructive" />
        <h1 className="font-heading text-3xl font-extrabold text-foreground">
          Acceso restringido
        </h1>
        <p className="text-muted-foreground">
          Esta sección es solo para administradores de Califica UV.
        </p>
        <Button className="h-11 cursor-pointer" render={<Link href="/">Volver al inicio</Link>} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="font-heading text-4xl font-extrabold text-foreground">Panel de administración</h1>
        <p className="mt-2 text-muted-foreground">
          Aquí solo puedes borrar contenido abusivo. Todo queda registrado en
          el log de auditoría. El sistema nunca te muestra a quién pertenece
          una reseña.
        </p>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports" className="cursor-pointer gap-1.5">
            <Flag className="size-4" /> Reportes
          </TabsTrigger>
          <TabsTrigger value="professors" className="cursor-pointer gap-1.5">
            <Users2 className="size-4" /> Profesores
          </TabsTrigger>
          <TabsTrigger value="audit" className="cursor-pointer gap-1.5">
            <ScrollText className="size-4" /> Auditoría
          </TabsTrigger>
          <TabsTrigger value="ban" className="cursor-pointer gap-1.5">
            <Ban className="size-4" /> Banear usuario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="flex flex-col gap-4 pt-4">
          {reportsQuery.isLoading && <Skeleton className="h-40 rounded-2xl" />}
          {reportsQuery.isError && <ErrorState onRetry={() => reportsQuery.refetch()} />}
          {!reportsQuery.isLoading &&
            !reportsQuery.isError &&
            (reportsQuery.data?.length ?? 0) === 0 && (
              <EmptyState icon={Flag} title="No hay reportes pendientes" />
            )}
          {reportsQuery.data?.map((report) => (
            <div
              key={report.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div>
                <p className="text-sm text-muted-foreground">
                  Reseña <code className="rounded bg-muted px-1.5 py-0.5">{report.reviewId}</code>
                </p>
                <p className="text-foreground">{report.reason}</p>
              </div>
              <DeleteDialog
                triggerLabel="Borrar reseña"
                title="Borrar esta reseña"
                description="La reseña se ocultará del sitio público (soft delete) y quedará el registro en el log de auditoría."
                onConfirm={(reason) =>
                  deleteReviewMutation.mutate({ id: report.reviewId, reason })
                }
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="professors" className="flex flex-col gap-4 pt-4">
          {professorsQuery.isLoading && <Skeleton className="h-40 rounded-2xl" />}
          {professorsQuery.isError && (
            <ErrorState onRetry={() => professorsQuery.refetch()} />
          )}
          {professorsQuery.data?.map((prof) => (
            <div
              key={prof.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div>
                <p className="font-heading text-lg font-extrabold text-foreground">
                  {prof.name}
                </p>
                <p className="text-sm text-muted-foreground">{prof.department}</p>
              </div>
              <DeleteDialog
                triggerLabel="Borrar profesor"
                title={`Borrar a ${prof.name}`}
                description="El profesor y sus reseñas se ocultarán del sitio público (soft delete) y quedará el registro en el log de auditoría."
                onConfirm={(reason) =>
                  deleteProfessorMutation.mutate({ id: prof.id, reason })
                }
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="flex flex-col gap-4 pt-4">
          {auditQuery.isLoading && <Skeleton className="h-40 rounded-2xl" />}
          {auditQuery.isError && <ErrorState onRetry={() => auditQuery.refetch()} />}
          {!auditQuery.isLoading &&
            !auditQuery.isError &&
            (auditQuery.data?.length ?? 0) === 0 && (
              <EmptyState icon={ScrollText} title="Sin acciones registradas todavía" />
            )}
          {auditQuery.data?.map((entry) => (
            <div key={entry.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm text-muted-foreground">
                {new Intl.DateTimeFormat("es-CO", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(entry.createdAt))}{" "}
                · por <strong className="text-foreground">{entry.adminUsername}</strong>
              </p>
              <p className="mt-1 text-foreground">
                <strong>{entry.action}</strong> sobre {entry.targetType}{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">{entry.targetId}</code>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Motivo: {entry.reason}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="ban" className="flex flex-col gap-4 pt-4">
          <BanUserPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
