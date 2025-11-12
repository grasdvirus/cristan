'use client';

import { useTheme } from '@/components/theme-provider';

export function CustomThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <input
      className="l"
      type="checkbox"
      checked={theme === 'dark'}
      onChange={toggleTheme}
      aria-label="Toggle theme"
    />
  );
}
