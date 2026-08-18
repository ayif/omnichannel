"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon } from "lucide-react";

import { Button } from "@/components/ui/button";

const OPTIONS = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Ikuti Sistem", icon: SunMoon },
] as const;

export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={mounted && theme === option.value ? "default" : "outline"}
          onClick={() => setTheme(option.value)}
        >
          <option.icon /> {option.label}
        </Button>
      ))}
    </div>
  );
}
