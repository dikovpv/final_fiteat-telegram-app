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
  background: '#f3f4f6',
  surface: '#ffffff',
  textPrimary: '#0f172a',
  textSecondary: '#5b6471',
  accent: '#111827',
};

export const darkTheme: AppTheme = {
  name: 'dark',
  background: '#0f1115',
  surface: '#161a20',
  textPrimary: '#f4f5f7',
  textSecondary: '#b1b7c2',
  accent: '#f5f5f2',
};

export const THEMES: Record<ThemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
