"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, LogOut, Menu, Shield, User as UserIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/lib/api";
import { toast } from "sonner";

const navLinks = [
  { href: "/profesores", label: "Profesores" },
  { href: "/materias", label: "Materias" },
  { href: "/profesores/nuevo", label: "Proponer profesor" },
  { href: "/profesores/pendientes", label: "Pendientes" },
];

export function SiteHeader() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleLogout() {
    await logout();
    queryClient.setQueryData(["me"], null);
    toast.success("Sesión cerrada");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-xl font-extrabold text-foreground transition-colors duration-200 hover:text-primary"
        >
          <GraduationCap className="size-6 text-primary" aria-hidden />
          Califica UV
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors duration-200 hover:bg-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="h-11 cursor-pointer gap-2 px-3">
                    <Avatar className="size-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {(user?.username ?? "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[8rem] truncate">
                      {user?.username ?? "Sin seudónimo"}
                    </span>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem
                  render={
                    <Link href="/cuenta" className="cursor-pointer">
                      <UserIcon className="size-4" /> Mi cuenta
                    </Link>
                  }
                />
                {isAdmin && (
                  <DropdownMenuItem
                    render={
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="size-4" /> Panel admin
                      </Link>
                    }
                  />
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className="h-11 cursor-pointer"
              render={<Link href="/login">Ingresar</Link>}
            />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="size-11 cursor-pointer md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-medium text-foreground/80 transition-colors duration-200 hover:bg-muted hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
