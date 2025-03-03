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
    // Capture the current value of the ref at the start of the effect
    const startTimeValue = startTime.current;
    
    const handleInteraction = (): void => {
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
        renderTime: endTime - startTimeValue,
        interactionTime: firstInteractionTime.current 
          ? firstInteractionTime.current - startTimeValue 
          : null
      };

      onMetricsCollected?.(metrics);
    };
  }, [componentName, onMetricsCollected]);

  return <>{children}</>;
} 