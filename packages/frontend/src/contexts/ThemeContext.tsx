import { createContext, useContext } from 'react';

export interface ThemeContextValue {
  updateTheme: (interfaceStyle: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export { ThemeContext };
export default ThemeContext;
