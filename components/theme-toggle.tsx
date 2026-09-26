"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import { useThemePreference, type ThemePreference } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useThemePreference();
  const nextPreference: ThemePreference = theme === "system"
    ? "light"
    : theme === "light"
      ? "dark"
      : "system";
  const Icon = theme === "system"
    ? SunMoon
    : theme === "dark"
      ? Moon
      : Sun;
  const label = `Theme preference: ${theme}. Switch to ${nextPreference} theme`;

  return (
    <button
      aria-label={label}
      className="icon-button theme-toggle"
      onClick={() => setTheme(nextPreference)}
      title={label}
      type="button"
    >
      <Icon size={19} aria-hidden="true" />
    </button>
  );
}