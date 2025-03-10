'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';
import { useToast } from '@chakra-ui/react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Add a script to prevent flash of unstyled content
function createNoFlashScript(): string {
  return `
    (function() {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') return;
        
        var storedTheme = null;
        try {
          storedTheme = localStorage.getItem('theme');
        } catch (storageError) {
          console.warn('Error accessing localStorage:', storageError);
        }
        
        if (storedTheme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.classList.remove('dark');
        }
        
        // Add a class to indicate JS is enabled
        document.documentElement.classList.add('js-enabled');
      } catch (e) {
        console.warn('Error in theme initialization script:', e);
        // Default to light theme in case of error
        if (document && document.documentElement) {
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.classList.remove('dark');
        }
      }
    })();
  `;
}

export function ThemeProvider({ children }: { children: ReactNode }): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');
  const initializedRef = useRef(false);
  const toast = useToast();

  // Apply theme settings to document
  const applyThemeSettings = useCallback((newTheme: Theme) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // After mounting, we have access to the window object
  useEffect(() => {
    // First set mounted to true
    setMounted(true);
    
    // Only initialize once
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      
      // Check if theme is stored in localStorage
      const storedTheme = localStorage.getItem('theme') as Theme | null;
      
      if (storedTheme === 'dark') {
        setThemeState('dark');
        applyThemeSettings('dark');
      } else {
        // Apply light theme as default
        applyThemeSettings('light');
        
        // If no preference is stored, save the default (light)
        if (storedTheme === null) {
          localStorage.setItem('theme', 'light');
        }
      }
      
      // Enable transitions after initial load
      setTimeout(() => {
        document.documentElement.classList.add('js-enabled');
      }, 100);
    } catch (error) {
      // Handle localStorage errors (e.g., in incognito mode)
      console.warn('Error accessing localStorage:', error);
      // Apply default theme in case of error
      applyThemeSettings('light');
    }
  }, [applyThemeSettings]);

  // Set theme function
  const setTheme = useCallback((newTheme: Theme): void => {
    setThemeState(newTheme);
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
      
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Error saving to localStorage:', error);
    }
    
    // Apply theme settings
    applyThemeSettings(newTheme);
    
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode enabled`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [applyThemeSettings, toast]);

  const value: ThemeContextType = {
    theme,
    setTheme
  };

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
      <ThemeContext.Provider value={value}>
        {mounted ? (
          <NextThemeProvider
            attribute="class"
            defaultTheme="light"
            value={{
              light: 'light',
              dark: 'dark',
              system: 'system'
            }}
            enableSystem={false}
            disableTransitionOnChange
            forcedTheme={theme}
          >
            {children}
          </NextThemeProvider>
        ) : (
          children
        )}
      </ThemeContext.Provider>
    </>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.warn('useTheme was called outside of ThemeProvider. Using fallback values.');
    // Return a fallback context with default values
    return {
      theme: 'light',
      setTheme: () => {},
    };
  }
  return context;
} 