'use client';

import { useEffect, useRef } from 'react';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  interactionTime: number | null;
  loadTime?: number;
}

interface Props {
  componentName: string;
  children: React.ReactNode;
  onMetricsCollected?: (metrics: PerformanceMetrics) => void;
}

export function TestRunPerformanceTracker({ 
  componentName, 
  children,
  onMetricsCollected 
}: Props): JSX.Element {
  const startTime = useRef(performance.now());
  const firstInteractionTime = useRef<number | null>(null);
  
  usePerformanceMonitoring();

  useEffect(() => {
    const handleInteraction = () => {
      if (!firstInteractionTime.current) {
        firstInteractionTime.current = performance.now();
      }
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);

      const endTime = performance.now();
      const metrics: PerformanceMetrics = {
        componentName,
        renderTime: endTime - startTime.current,
        interactionTime: firstInteractionTime.current 
          ? firstInteractionTime.current - startTime.current 
          : null
      };

      onMetricsCollected?.(metrics);
    };
  }, [componentName, onMetricsCollected]);

  return <>{children}</>;
} 