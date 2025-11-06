"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  React.useEffect(() => {
    console.log("Tema atual:", theme);
  }, [theme]);

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${theme === 'light' ? 'bg-accent text-accent-foreground' : ''}`}
        onClick={() => {
          setTheme("light");
          console.log("Definindo tema para claro");
        }}
        aria-label="Ativar tema claro"
      >
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}`}
        onClick={() => {
          setTheme("dark");
          console.log("Definindo tema para escuro");
        }}
        aria-label="Ativar tema escuro"
      >
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    </div>
  );
}