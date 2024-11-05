import { useState, useEffect } from 'react';
import { generateCSRFToken } from '@/lib/auth/csrf';

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  useEffect(() => {
    setCSRFToken(generateCSRFToken());
  }, []);

  return csrfToken;
} 