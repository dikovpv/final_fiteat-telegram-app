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
  background: '#F5F7FA',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  accent: '#6DC47E', // твой зелёный FitEat
};

export const darkTheme: AppTheme = {
  name: 'dark',
  background: '#020617',
  surface: '#0F172A',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  accent: '#6DC47E',
};

export const THEMES: Record<ThemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
};
