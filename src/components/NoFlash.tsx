'use client';

import { useEffect, useState } from 'react';

export function NoFlash(): JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Force immediate visibility to prevent FOUC
    if (typeof document !== 'undefined') {
      document.documentElement.style.visibility = 'visible';
      document.documentElement.style.opacity = '1';
    }
  }, []);

  // Don't render anything during SSR
  if (!mounted) return null;

  return (
    <style jsx global>{`
      /* Force consistent styling for inputs across all themes */
      input, input[type="text"], input[type="password"], input[type="email"] {
        opacity: 1 !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem 0.75rem !important;
        font-size: 1rem !important;
        line-height: 1.5 !important;
        transition: none !important;
      }
      
      /* Standard contrast mode styles */
      html:not(.high-contrast) input, 
      html:not(.high-contrast) input[type="text"], 
      html:not(.high-contrast) input[type="password"], 
      html:not(.high-contrast) input[type="email"] {
        background-color: white !important;
        color: black !important;
        -webkit-text-fill-color: black !important;
        border: 1px solid #e2e8f0 !important;
      }
      
      /* Dark mode styles */
      html.dark:not(.high-contrast) input, 
      html.dark:not(.high-contrast) input[type="text"], 
      html.dark:not(.high-contrast) input[type="password"], 
      html.dark:not(.high-contrast) input[type="email"] {
        background-color: #2d3748 !important;
        color: white !important;
        -webkit-text-fill-color: white !important;
        border: 1px solid #4a5568 !important;
      }
      
      /* High contrast mode styles - these will be applied via CSS classes */
      html.high-contrast input, 
      html.high-contrast input[type="text"], 
      html.high-contrast input[type="password"], 
      html.high-contrast input[type="email"] {
        background-color: black !important;
        color: white !important;
        -webkit-text-fill-color: white !important;
        border: 3px solid white !important;
      }
      
      /* Force consistent styling for buttons */
      button, .chakra-button {
        transition: none !important;
      }
      
      /* Force consistent styling for the profile menu */
      .chakra-menu__menu-button {
        padding: 0 !important;
        height: auto !important;
      }
      
      .chakra-avatar {
        border-radius: 50% !important;
        border: 2px solid transparent !important;
      }
      
      html.dark .chakra-avatar {
        border-color: #38bdf8 !important;
      }
    `}</style>
  );
} 