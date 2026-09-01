"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, EyeOff, Loader2, ShieldOff, UserRound, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { checkUsernameAvailable, setUsername, ApiError } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9_]{3,20}$/,
      "3 a 20 caracteres: minúsculas, números y guion bajo, nada más"
    ),
});

type UsernameFormValues = z.infer<typeof usernameSchema>;

export default function BienvenidoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
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

  useEffect(() => {
    if (!authLoading && user && user.username) {
      router.replace("/cuenta");
    }
  }, [authLoading, user, router]);

  const availability = useQuery({
    queryKey: ["username-available", debounced],
    queryFn: () => checkUsernameAvailable(debounced),
    enabled: formatValid,
  });

  const mutation = useMutation({
    mutationFn: () => setUsername(debounced),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["me"], updatedUser);
      toast.success(`¡Listo parce! Ahora eres ${updatedUser.username}`);
      router.push("/");
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError && err.code === "USERNAME_DERIVED_FROM_IDENTITY") {
        setError("username", {
          message:
            "Ese seudónimo se parece mucho a tu nombre o a tu correo. Se pierde la gracia, elige otro.",
        });
      } else if (err instanceof ApiError) {
        setError("username", { message: err.message });
      } else {
        setError("username", { message: "No se pudo guardar. Intenta otra vez." });
      }
    },
  });

  function onSubmit() {
    if (availability.data && !availability.data.available) {
      setError("username", {
        message: availability.data.reason ?? "Ese ya está cogido, prueba con otro.",
      });
      return;
    }
    mutation.mutate();
  }

  const canSubmit = formatValid && availability.data?.available && !mutation.isPending;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16 sm:px-6">
      <header className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <EyeOff className="size-8" aria-hidden />
        </div>
        <h1 className="font-heading text-4xl font-extrabold text-foreground">
          Ponte un alias
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          Esto es lo único que va a ver la gente. Tu correo y tu nombre real{" "}
          <strong className="text-foreground">nunca</strong> se muestran acá —
          ni siquiera los admins los ven.
        </p>
        <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
          <ShieldOff className="size-4" /> Que no se te ocurra poner tu nombre
        </div>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <Field data-invalid={!!errors.username}>
          <FieldLabel htmlFor="username">Tu alias</FieldLabel>
          <Input
            id="username"
            placeholder="ej: gato_curioso42"
            className="h-12 text-base"
            aria-describedby="username-status"
            autoComplete="off"
            {...register("username")}
          />
          <FieldDescription>
            3–20 caracteres: minúsculas, números y guion bajo. Lo puedes
            cambiar después, pero solo una vez cada 30 días.
          </FieldDescription>

          <div id="username-status" aria-live="polite" className="min-h-[24px] text-sm">
            {formatValid && availability.isLoading && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Viendo si está libre...
              </span>
            )}
            {formatValid && availability.data?.available && (
              <span className="flex items-center gap-1.5 text-accent">
                <CheckCircle2 className="size-4" /> ¡Libre! Ese sí se puede
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

        <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {(debounced || "??").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              Así vas a firmar tus reseñas
            </span>
            <span className="flex items-center gap-1.5 font-heading text-lg font-extrabold text-foreground">
              <UserRound className="size-4 text-primary" />
              {debounced || "tu_alias"}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full cursor-pointer text-base active:scale-[0.98]"
        >
          {mutation.isPending ? "Guardando..." : "Listo, ese es mi alias"}
        </Button>
      </form>
    </div>
  );
}
