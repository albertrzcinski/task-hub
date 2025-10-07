import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Mode = 'light' | 'dark';

type ThemeContextValue = {
  mode: Mode;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProviderLocal({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  const toggleMode = useCallback(() => setMode((m) => (m === 'light' ? 'dark' : 'light')), []);
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProviderLocal');
  return ctx;
}
