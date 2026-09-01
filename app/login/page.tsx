"use client";

import { GraduationCap, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loginWithGoogleUrl } from "@/lib/api";

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <GraduationCap className="size-8" aria-hidden />
        </div>
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-foreground">
            ¡Qué hubo!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Solo entran estudiantes con correo institucional de la Univalle.
            Sin ese correo, no hay chisme.
          </p>
        </div>

        <Button
          className="h-12 w-full cursor-pointer gap-2 text-base active:scale-[0.98]"
          render={
            <a href={loginWithGoogleUrl()}>
              <Lock className="size-4" /> Entrar con tu correo institucional
            </a>
          }
        />

        <div className="flex items-start gap-2 rounded-xl bg-muted p-4 text-left text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <p>
            Verificamos tu correo en el servidor, tranquilo. Tu correo y tu
            nombre real nunca se muestran en el sitio: eliges un alias apenas
            entres.
          </p>
        </div>
      </div>
    </div>
  );
}
