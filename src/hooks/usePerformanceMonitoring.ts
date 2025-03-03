'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/performance';
import { logger } from '@/lib/logger';

// Add missing type definitions
interface LayoutShift extends PerformanceEntry {
  value: number;
}

interface FirstInputDelay extends PerformanceEntry {
  processingStart: number;
  startTime: number;
}

export interface WebVitalsMetric {
  id: string;
  name: string;
  label: string;
  value: number;
  delta: number;
  startTime: number;
}

export function usePerformanceMonitoring(reportHandler?: (metric: WebVitalsMetric) => void): void {
  useEffect(() => {
    const metrics: WebVitalsMetric[] = [];
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Extract the appropriate value based on entry type
        let value = 0;
        let delta = undefined;
        
        if (entry.entryType === 'layout-shift') {
          // For CLS
          value = (entry as LayoutShift).value;
          delta = value;
        } else if (entry.entryType === 'largest-contentful-paint') {
          // For LCP
          value = (entry as LargestContentfulPaint).startTime;
        } else if (entry.entryType === 'first-input') {
          // For FID
          value = (entry as FirstInputDelay).processingStart - (entry as FirstInputDelay).startTime;
          delta = value;
        } else {
          // For other metrics
          value = entry.duration || entry.startTime || 0;
        }
        
        const metric: WebVitalsMetric = {
          id: entry.id || entry.name,
          name: entry.name,
          label: entry.entryType,
          value,
          delta,
          startTime: performance.now()
        };
        
        metrics.push(metric);
        reportWebVitals(metric);
      });
    });

    observer.observe({ 
      entryTypes: [
        'paint',
        'largest-contentful-paint',
        'first-input',
        'layout-shift'
      ] 
    });

    return () => {
      observer.disconnect();
      // Report final metrics on unmount
      if (metrics.length > 0) {
        console.debug('Component performance metrics:', metrics);
      }
    };
  }, [reportHandler]);
} 