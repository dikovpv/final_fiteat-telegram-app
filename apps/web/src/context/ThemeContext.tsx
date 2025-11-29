"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const saved = window.localStorage.getItem("fitEatTheme");
  if (saved === "dark" || saved === "light") return saved as Theme;

  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  // Применяем классы к <html> и сохраняем тему
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    root.classList.remove("theme-dark", "theme-light", "cosmic-theme", "luxury-theme");

    if (theme === "dark") {
      root.classList.add("theme-dark");
    } else {
      root.classList.add("theme-light");
    }

    window.localStorage.setItem("fitEatTheme", theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  const value: ThemeContextValue = { theme, toggleTheme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
