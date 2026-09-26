"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const themeStorageKey = "learn-it-theme";
const systemColorScheme = "(prefers-color-scheme: dark)";
const ThemeContext = createContext<ThemeContextValue | null>(null);
const subscribers = new Set<() => void>();
let stopListening: (() => void) | null = null;

function readTheme(): ThemePreference {
  try {
    const value = window.localStorage.getItem(themeStorageKey);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

function applyTheme(theme: ThemePreference) {
  const followsDarkSystem = theme === "system" && window.matchMedia(systemColorScheme).matches;
  const isDark = theme === "dark" || followsDarkSystem;
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber());
}

function handleStorageChange(event: StorageEvent) {
  if (event.key === themeStorageKey || event.key === null) {
    applyTheme(readTheme());
    notifySubscribers();
  }
}

function handleSystemPreferenceChange() {
  if (readTheme() === "system") {
    applyTheme("system");
    notifySubscribers();
  }
}

function subscribe(subscriber: () => void) {
  subscribers.add(subscriber);

  if (!stopListening) {
    const mediaQuery = window.matchMedia(systemColorScheme);
    window.addEventListener("storage", handleStorageChange);
    mediaQuery.addEventListener("change", handleSystemPreferenceChange);
    stopListening = () => {
      window.removeEventListener("storage", handleStorageChange);
      mediaQuery.removeEventListener("change", handleSystemPreferenceChange);
      stopListening = null;
    };
  }

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) stopListening?.();
  };
}

function getServerTheme(): ThemePreference {
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerTheme);

  function setTheme(nextTheme: ThemePreference) {
    try {
      window.localStorage.setItem(themeStorageKey, nextTheme);
    } catch {
      // Keep the in-page choice working when browser storage is unavailable.
    }
    applyTheme(nextTheme);
    notifySubscribers();
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemePreference must be used within ThemeProvider.");
  return context;
}