/**
 * Color palette for the application
 * These colors are used throughout the application for consistency
 */

// Primary colors
export const primary = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
};

// Secondary/neutral colors
export const neutral = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
};

// Semantic colors
export const semantic = {
  success: {
    light: '#10b981',
    dark: '#34d399',
  },
  error: {
    light: '#ef4444',
    dark: '#f87171',
  },
  warning: {
    light: '#f59e0b',
    dark: '#fbbf24',
  },
  info: {
    light: '#3b82f6',
    dark: '#60a5fa',
  },
};

// Theme-specific colors
export const theme = {
  light: {
    background: '#ffffff',
    foreground: '#000000',
    card: '#ffffff',
    border: neutral[200],
  },
  dark: {
    background: neutral[800],
    foreground: neutral[50],
    card: neutral[800],
    border: neutral[700],
  },
};

// Export all colors as a single object
export const colors = {
  primary,
  neutral,
  semantic,
  theme,
}; 