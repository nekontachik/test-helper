'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import type { ChakraTheme } from '@chakra-ui/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { theme as designSystemTheme } from './foundations';
import { generateCssVariables } from './foundations/css-variables';

// Define the theme modes
export type ThemeMode = 'light' | 'dark' | 'system';

// Define the theme context type
interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create the Chakra UI theme based on our design system
const createChakraTheme = (isDarkMode: boolean): ChakraTheme => {
  const { colors, typography, spacing, breakpoints } = designSystemTheme;
  
  return extendTheme({
    colors: {
      primary: colors.primary,
      gray: colors.neutral,
      // Add semantic colors
      success: isDarkMode ? colors.semantic.success.dark : colors.semantic.success.light,
      error: isDarkMode ? colors.semantic.error.dark : colors.semantic.error.light,
      warning: isDarkMode ? colors.semantic.warning.dark : colors.semantic.warning.light,
      info: isDarkMode ? colors.semantic.info.dark : colors.semantic.info.light,
    },
    fonts: {
      body: typography.fontFamily.sans,
      heading: typography.fontFamily.sans,
      mono: typography.fontFamily.mono,
    },
    fontSizes: typography.fontSize,
    fontWeights: typography.fontWeight,
    lineHeights: typography.lineHeight,
    letterSpacings: typography.letterSpacing,
    space: spacing.spacing,
    breakpoints: {
      sm: `${breakpoints.values.sm}px`,
      md: `${breakpoints.values.md}px`,
      lg: `${breakpoints.values.lg}px`,
      xl: `${breakpoints.values.xl}px`,
      '2xl': `${breakpoints.values['2xl']}px`,
    },
    styles: {
      global: {
        body: {
          bg: isDarkMode ? colors.theme.dark.background : colors.theme.light.background,
          color: isDarkMode ? colors.theme.dark.foreground : colors.theme.light.foreground,
        },
      },
    },
    config: {
      initialColorMode: isDarkMode ? 'dark' : 'light',
      useSystemColorMode: false,
    },
  }) as ChakraTheme;
};

// Add type declaration for the __THEME_INITIALIZED__ property
declare global {
  interface Window {
    __THEME_INITIALIZED__?: boolean;
  }
}

// Create a script to prevent flash of unstyled content
function createNoFlashScript(): string {
  return `
    (function() {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        
        // Check if already initialized to prevent duplicate initialization
        if (window.__THEME_INITIALIZED__) return;
        
        // Mark as initialized immediately
        window.__THEME_INITIALIZED__ = true;
        
        // Apply theme immediately before any React code runs
        var storedTheme = null;
        try {
          storedTheme = localStorage.getItem('theme-mode');
        } catch (storageError) {
          console.warn('Error accessing localStorage:', storageError);
        }
        
        if (storedTheme === 'dark' || 
            (storedTheme === 'system' && 
             window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
        
        // Force all elements to be visible
        document.documentElement.style.visibility = 'visible';
        document.documentElement.style.opacity = '1';
        
        // Add a class to indicate JS is enabled
        document.documentElement.classList.add('js-enabled');
        
        // Disable all transitions during initial load
        var style = document.createElement('style');
        style.textContent = '* { transition: none !important; }';
        document.head.appendChild(style);
        
        // Remove the style after a short delay to re-enable transitions
        setTimeout(function() {
          document.head.removeChild(style);
        }, 100);
      } catch (e) {
        console.warn('Error in theme initialization script:', e);
        // Default to light theme in case of error
        if (document && document.documentElement) {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.style.visibility = 'visible';
          document.documentElement.style.opacity = '1';
          document.documentElement.classList.add('js-enabled');
        }
      }
    })();
  `;
}

interface DesignSystemProviderProps {
  children: React.ReactNode;
}

export function DesignSystemProvider({ children }: DesignSystemProviderProps): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [mode, setModeState] = useState<ThemeMode>('light');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Function to determine if dark mode is active
  const calculateIsDarkMode = useCallback((currentMode: ThemeMode): boolean => {
    if (currentMode === 'dark') return true;
    if (currentMode === 'light') return false;
    // For 'system', check the system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, []);
  
  // Function to set the theme mode
  const setMode = useCallback((newMode: ThemeMode): void => {
    setModeState(newMode);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme-mode', newMode);
      } catch (error) {
        console.warn('Error saving theme mode to localStorage:', error);
      }
    }
    
    // Update dark mode state
    setIsDarkMode(calculateIsDarkMode(newMode));
  }, [calculateIsDarkMode]);
  
  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    
    // Get theme from localStorage or default to system
    if (typeof window !== 'undefined') {
      try {
        const storedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
        if (storedMode) {
          setModeState(storedMode);
          setIsDarkMode(calculateIsDarkMode(storedMode));
        } else {
          // Default to system
          setModeState('system');
          setIsDarkMode(calculateIsDarkMode('system'));
        }
      } catch (error) {
        console.warn('Error reading theme mode from localStorage:', error);
      }
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (): void => {
      if (mode === 'system') {
        setIsDarkMode(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, calculateIsDarkMode]);
  
  // Create the Chakra theme based on dark mode state
  const chakraTheme = createChakraTheme(isDarkMode);
  
  // Create the theme context value
  const themeContextValue: ThemeContextType = {
    mode,
    setMode,
    isDarkMode,
  };
  
  // Generate CSS variables
  const generateCssVariablesCallback = useCallback((): string => {
    return generateCssVariables();
  }, []);

  const cssVariables = useMemo((): string => {
    return generateCssVariablesCallback();
  }, [generateCssVariablesCallback]);
  
  return (
    <>
      {/* Add script to prevent flash of unstyled content */}
      {!mounted && (
        <script
          dangerouslySetInnerHTML={{
            __html: createNoFlashScript()
          }}
        />
      )}
      
      {/* Add CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      
      <ThemeContext.Provider value={themeContextValue}>
        <NextThemeProvider
          attribute="class"
          defaultTheme="system"
          value={{
            light: 'light',
            dark: 'dark',
            system: 'system',
          }}
          enableSystem
          disableTransitionOnChange
          forcedTheme={isDarkMode ? 'dark' : 'light'}
        >
          <ChakraProvider theme={chakraTheme} resetCSS>
            {children}
          </ChakraProvider>
        </NextThemeProvider>
      </ThemeContext.Provider>
    </>
  );
}

// Hook to use the theme context
export function useDesignSystem(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
} 