
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { intelligentThemeSwitching } from '@/ai/flows/intelligent-theme-switching';

type Theme = "light" | "dark" | "image";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // For the old switch
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    const initializeTheme = async () => {
      if (storedTheme) {
        setThemeState(storedTheme);
      } else {
        try {
          const hours = new Date().getHours();
          let timeOfDay = 'morning';
          if (hours >= 12 && hours < 18) timeOfDay = 'afternoon';
          else if (hours >= 18 && hours < 22) timeOfDay = 'evening';
          else if (hours >= 22 || hours < 6) timeOfDay = 'night';
          
          const result = await intelligentThemeSwitching({ timeOfDay });
          const aiTheme = result.theme as 'light' | 'dark'; // AI only suggests light/dark
          setThemeState(aiTheme);
          localStorage.setItem('theme', aiTheme);
        } catch (error) {
          console.error("AI theme switching failed, falling back to system preference.", error);
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const defaultTheme = prefersDark ? 'dark' : 'light';
          setThemeState(defaultTheme);
          localStorage.setItem('theme', defaultTheme);
        }
      }
    };

    initializeTheme();
  }, []);
  
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    root.classList.remove('light', 'dark');
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundAttachment = '';

    if (theme === 'image') {
        body.style.backgroundImage = "url('/arri.jpg')";
        body.style.backgroundSize = 'cover';
        body.style.backgroundAttachment = 'fixed';
        // You might want a default class for text readability over the image
        root.classList.add('dark'); 
    } else {
        root.classList.add(theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };
  
  const toggleTheme = () => {
    setThemeState((prevTheme) => {
        if (prevTheme === 'image') return 'light';
        return prevTheme === 'light' ? 'dark' : 'light';
    });
  };
  
  const value = { theme, setTheme, toggleTheme };

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
