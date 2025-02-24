'use client';

import { useEffect } from 'react';
import { Workbox } from 'workbox-window';

export function PWAInit() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      const wb = new Workbox('/service-worker.js');

      wb.addEventListener('installed', event => {
        if (event.isUpdate) {
          if (confirm('New app update is available! Reload to update?')) {
            window.location.reload();
          }
        }
      });

      wb.register().catch(error => {
        console.error('Service worker registration failed:', error);
      });
    }
  }, []);

  return null;
} 