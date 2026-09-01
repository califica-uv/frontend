import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-2">
          <GraduationCap className="mt-1 size-6 text-primary" aria-hidden />
          <div>
            <p className="font-heading text-lg font-extrabold">Califica UV</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Reseñas anónimas de profesores hechas por y para estudiantes de
              la Universidad del Valle. Existimos para ayudarte a elegir
              clase, no para linchar a nadie: sé constructivo.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Link href="/profesores" className="text-foreground/80 transition-colors duration-200 hover:text-primary">
            Profesores
          </Link>
          <Link href="/materias" className="text-foreground/80 transition-colors duration-200 hover:text-primary">
            Materias
          </Link>
          <Link href="/profesores/nuevo" className="text-foreground/80 transition-colors duration-200 hover:text-primary">
            Proponer profesor
          </Link>
          <Link href="/login" className="text-foreground/80 transition-colors duration-200 hover:text-primary">
            Ingresar
          </Link>
        </div>
      </div>
      <p className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Califica UV. No afiliado oficialmente a
        la Universidad del Valle.
      </p>
    </footer>
  );
}
