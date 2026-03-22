'use client';
import { useEffect } from 'react';

const THEMES: Record<string, Record<string, string>> = {
  cyan: { '--neon-cyan': '#00f5d4', '--neon-blue': '#00bbf9', '--dark-bg': '#0a0e27' },
  red: { '--neon-cyan': '#ff4757', '--neon-blue': '#ff6b81', '--dark-bg': '#1a0a0e' },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const saved = localStorage.getItem('bscxau-theme') || 'cyan';
    const vars = THEMES[saved] || THEMES.cyan;
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, []);

  return <>{children}</>;
}
