"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, LogOut, ShieldCheck, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, checkUsernameAvailable, logout, setUsername } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]{3,20}$/, "3 a 20 caracteres: minúsculas, números y guion bajo"),
});
type UsernameFormValues = z.infer<typeof usernameSchema>;

export default function CuentaPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    mode: "onBlur",
    defaultValues: { username: "" },
  });

  const rawValue = watch("username") ?? "";
  const debounced = useDebounce(rawValue.trim().toLowerCase(), 400);
  const formatValid = /^[a-z0-9_]{3,20}$/.test(debounced);

  const availability = useQuery({
    queryKey: ["username-available", debounced],
    queryFn: () => checkUsernameAvailable(debounced),
    enabled: formatValid && debounced !== user?.username,
  });

  const changeMutation = useMutation({
    mutationFn: () => setUsername(debounced),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["me"], updatedUser);
      toast.success("Listo, ya quedó el nuevo alias");
      reset();
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) setError("username", { message: err.message });
      else setError("username", { message: "No se pudo actualizar. Intenta de nuevo." });
    },
  });

  async function handleLogout() {
    await logout();
    queryClient.setQueryData(["me"], null);
    router.push("/");
  }

  function onSubmit() {
    if (availability.data && !availability.data.available) {
      setError("username", {
        message: availability.data.reason ?? "Ese alias ya está cogido.",
      });
      return;
    }
    changeMutation.mutate();
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="font-heading text-3xl font-extrabold text-foreground">
          Primero entra a tu cuenta
        </h1>
        <Button className="h-11 cursor-pointer" render={<a href="/login">Ir a iniciar sesión</a>} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-16 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarFallback className="bg-primary text-xl text-primary-foreground">
            {(user.username ?? "??").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-foreground">
            {user.username}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.role === "admin" ? "Administrador" : "Estudiante"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h2 className="font-heading text-2xl font-extrabold text-foreground">
          Cambiar de alias
        </h2>
        <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
          Solo puedes cambiarlo una vez cada 30 días. Nadie ve tu nombre real
          ni tu correo, tranquilo.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-3">
          <Field data-invalid={!!errors.username}>
            <FieldLabel htmlFor="new-username">Nuevo alias</FieldLabel>
            <Input
              id="new-username"
              placeholder={user.username ?? "nuevo_alias"}
              className="h-11"
              autoComplete="off"
              {...register("username")}
            />
            <FieldDescription className="sr-only">
              3 a 20 caracteres, minúsculas, números y guion bajo
            </FieldDescription>

            <div aria-live="polite" className="min-h-[22px] text-sm">
              {formatValid && availability.isLoading && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Verificando...
                </span>
              )}
              {formatValid && availability.data?.available && (
                <span className="flex items-center gap-1.5 text-accent">
                  <CheckCircle2 className="size-4" /> Disponible
                </span>
              )}
              {formatValid && availability.data && !availability.data.available && (
                <span className="flex items-center gap-1.5 text-destructive">
                  <XCircle className="size-4" /> {availability.data.reason}
                </span>
              )}
            </div>

            <FieldError errors={[errors.username]} />
          </Field>

          <Button
            type="submit"
            disabled={!formatValid || changeMutation.isPending}
            className="h-11 w-full cursor-pointer sm:w-auto sm:self-start"
          >
            {changeMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </div>

      <Separator />

      <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-foreground">
            Cerrar sesión
          </h2>
          <p className="text-sm text-muted-foreground">
            Puedes volver a entrar cuando quieras con tu correo institucional.
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="h-11 cursor-pointer gap-2"
        >
          <LogOut className="size-4" /> Salir
        </Button>
      </div>
    </div>
  );
}
