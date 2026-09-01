"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Cambiar tema claro/oscuro"
      className="size-11 cursor-pointer"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span suppressHydrationWarning>
        {resolvedTheme === "dark" ? (
          <Sun className="size-5" />
        ) : (
          <Moon className="size-5" />
        )}
      </span>
    </Button>
  );
}
