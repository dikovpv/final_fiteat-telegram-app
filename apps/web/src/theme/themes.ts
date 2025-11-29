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
  background: '#e9edf3',
  surface: '#f9fbfd',
  textPrimary: '#0c1524',
  textSecondary: '#4f5868',
  accent: '#48e29d',
};

export const darkTheme: AppTheme = {
  name: 'dark',
  background: '#090f1a',
  surface: '#0f1726',
  textPrimary: '#f6f8fb',
  textSecondary: '#b7c0d0',
  accent: '#4ce6a1',
};

export const THEMES: Record<ThemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
