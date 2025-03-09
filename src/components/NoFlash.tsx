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
      input, input[type="text"], input[type="password"], input[type="email"] {
        background-color: white !important;
        color: black !important;
        -webkit-text-fill-color: black !important;
        opacity: 1 !important;
      }
      
      .dark input, .dark input[type="text"], .dark input[type="password"], .dark input[type="email"] {
        background-color: white !important;
        color: black !important;
        -webkit-text-fill-color: black !important;
      }
    `}</style>
  );
} 