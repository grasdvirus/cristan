"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { intelligentThemeSwitching } from '@/ai/flows/intelligent-theme-switching';

type Theme = "light" | "dark";

type ThemeProviderState = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    const initializeTheme = async () => {
      if (storedTheme) {
        setTheme(storedTheme);
      } else {
        try {
          const hours = new Date().getHours();
          let timeOfDay = 'morning';
          if (hours >= 12 && hours < 18) timeOfDay = 'afternoon';
          else if (hours >= 18 && hours < 22) timeOfDay = 'evening';
          else if (hours >= 22 || hours < 6) timeOfDay = 'night';
          
          const result = await intelligentThemeSwitching({ timeOfDay });
          const aiTheme = result.theme;
          setTheme(aiTheme);
          localStorage.setItem('theme', aiTheme);
        } catch (error) {
          console.error("AI theme switching failed, falling back to system preference.", error);
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const defaultTheme = prefersDark ? 'dark' : 'light';
          setTheme(defaultTheme);
          localStorage.setItem('theme', defaultTheme);
        }
      }
    };

    initializeTheme();
  }, []);
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const value = { theme, toggleTheme };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
