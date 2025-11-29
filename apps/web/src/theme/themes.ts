// src/theme/themes.ts

export type ThemeName = 'light' | 'dark';

export interface AppTheme {
  name: ThemeName;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

export const lightTheme: AppTheme = {
  name: 'light',
  background: '#f6f3ec',
  surface: '#ffffff',
  textPrimary: '#1c1f21',
  textSecondary: '#4f555d',
  accent: '#2bd47f',
};

export const darkTheme: AppTheme = {
  name: 'dark',
  background: '#081316',
  surface: '#0d1d21',
  textPrimary: '#f3f6f7',
  textSecondary: '#b5c1c4',
  accent: '#32d27b',
};

export const THEMES: Record<ThemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
