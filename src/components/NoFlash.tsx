'use client';

import { useEffect, useState } from 'react';

export function NoFlash(): JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR
  if (!mounted) return null;

  return (
    <style jsx global>{`
      /* Basic input styles that work for all themes */
      input, input[type="text"], input[type="password"], input[type="email"] {
        opacity: 1 !important;
      }
      
      /* Standard contrast mode styles */
      html:not(.high-contrast) input, 
      html:not(.high-contrast) input[type="text"], 
      html:not(.high-contrast) input[type="password"], 
      html:not(.high-contrast) input[type="email"] {
        background-color: white !important;
        color: black !important;
        -webkit-text-fill-color: black !important;
      }
      
      /* Dark mode styles */
      html.dark:not(.high-contrast) input, 
      html.dark:not(.high-contrast) input[type="text"], 
      html.dark:not(.high-contrast) input[type="password"], 
      html.dark:not(.high-contrast) input[type="email"] {
        background-color: white !important;
        color: black !important;
        -webkit-text-fill-color: black !important;
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
    `}</style>
  );
} 