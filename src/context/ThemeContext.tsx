import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSetting, saveSetting } from '../data/db';

// ── Types ──────────────────────────────────────────────────────────────────

export const THEMES = ['default', 'default-dark'] as const;
export type Theme = typeof THEMES[number];

export const THEME_LABELS: Record<Theme, string> = {
  'default': 'Default',
  'default-dark': 'Default Dark',
};

// localStorage key — must match the inline script in index.html
export const THEME_STORAGE_KEY = 'theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isValidTheme(value: unknown): value is Theme {
  return (THEMES as readonly string[]).includes(value as string);
}

function applyThemeToDom(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function mirrorToLocalStorage(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (_e) {
    // localStorage unavailable (private browsing, storage full) — not fatal
  }
}

function readThemeFromLocalStorage(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(stored) ? stored : 'default';
  } catch (_e) {
    return 'default';
  }
}

// ── Context ────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Read localStorage synchronously so initial state matches what the
  // inline script in index.html already applied to the DOM.
  const [theme, setThemeState] = useState<Theme>(readThemeFromLocalStorage);

  // IndexedDB is the source of truth — sync it to localStorage on mount
  // so the two stores stay consistent after import/restore.
  useEffect(() => {
    getSetting<Theme>(THEME_STORAGE_KEY, 'default').then((saved) => {
      const validated = isValidTheme(saved) ? saved : 'default';
      setThemeState(validated);
      applyThemeToDom(validated);
      mirrorToLocalStorage(validated);
    });
  }, []);

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    saveSetting(THEME_STORAGE_KEY, newTheme);
    mirrorToLocalStorage(newTheme);
    applyThemeToDom(newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}