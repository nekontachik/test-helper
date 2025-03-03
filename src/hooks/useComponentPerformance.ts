'use client';

import { useRef, useEffect } from 'react';

interface PerformanceMarks {
  mount: string;
  render: string;
  interaction: string;
  unmount: string;
}

interface PerformanceOptions {
  componentName: string;
  trackInteractions?: boolean;
  trackRenders?: boolean;
  reportToAnalytics?: boolean;
}

/**
 * Hook to track component performance metrics
 */
export function useComponentPerformance({
  componentName,
  trackInteractions = true,
  trackRenders = true,
  reportToAnalytics = true
}: PerformanceOptions): void {
  const interactionTracked = useRef(false);
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());
  
  const markNames = useRef<PerformanceMarks>({
    mount: `${componentName}-mount`,
    render: `${componentName}-render`,
    interaction: `${componentName}-interaction`,
    unmount: `${componentName}-unmount`
  });
  
  // Track mount time
  useEffect(() => {
    const marks = markNames.current;
    performance.mark(marks.mount);
    
    // Report on unmount
    return () => {
      performance.mark(marks.unmount);
      
      try {
        // Create performance measures
        performance.measure(
          `${componentName}-lifecycle`,
          marks.mount,
          marks.unmount
        );
        
        // Get the measures
        const measures = performance.getEntriesByName(`${componentName}-lifecycle`);
        const lastMeasure = measures[measures.length - 1];
        
        // Log the performance data
        console.debug(`Component Performance: ${componentName}`, {
          mountToUnmount: lastMeasure?.duration || 0,
          renderCount: renderCount.current,
          hadUserInteraction: interactionTracked.current
        });
        
        // Report to analytics if enabled
        if (reportToAnalytics) {
          // Send to your analytics service
          // analytics.trackComponentPerformance({...})
        }
        
        // Clean up performance entries
        performance.clearMarks(marks.mount);
        performance.clearMarks(marks.unmount);
        performance.clearMeasures(`${componentName}-lifecycle`);
      } catch (error) {
        console.error('Error measuring component performance:', error);
      }
    };
  }, [componentName, reportToAnalytics]);
  
  // Track interactions if enabled
  useEffect(() => {
    if (!trackInteractions) return;
    
    const handleInteraction = () => {
      if (!interactionTracked.current) {
        interactionTracked.current = true;
        performance.mark(markNames.current.interaction);
        
        // Measure time to first interaction
        performance.measure(
          `${componentName}-time-to-interaction`,
          markNames.current.mount,
          markNames.current.interaction
        );
        
        const measures = performance.getEntriesByName(`${componentName}-time-to-interaction`);
        const lastMeasure = measures[measures.length - 1];
        
        console.debug(`Time to first interaction: ${componentName}`, {
          timeToInteraction: lastMeasure?.duration || 0
        });
      }
    };
    
    document.addEventListener('click', handleInteraction, { capture: true });
    document.addEventListener('keydown', handleInteraction, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction, { capture: true });
      document.removeEventListener('keydown', handleInteraction, { capture: true });
      
      performance.clearMarks(markNames.current.interaction);
      performance.clearMeasures(`${componentName}-time-to-interaction`);
    };
  }, [componentName, trackInteractions]);
  
  // Track renders if enabled
  useEffect(() => {
    if (!trackRenders) return;
    
    renderCount.current++;
    performance.mark(markNames.current.render + renderCount.current);
    
    if (renderCount.current > 1) {
      // Measure time between renders
      performance.measure(
        `${componentName}-render-${renderCount.current}`,
        markNames.current.render + (renderCount.current - 1),
        markNames.current.render + renderCount.current
      );
      
      const measures = performance.getEntriesByName(`${componentName}-render-${renderCount.current}`);
      const lastMeasure = measures[measures.length - 1];
      
      if (renderCount.current % 5 === 0) {
        console.debug(`Render count: ${componentName}`, {
          renderCount: renderCount.current,
          lastRenderDuration: lastMeasure?.duration || 0
        });
      }
    }
    
    return () => {
      performance.clearMarks(markNames.current.render + renderCount.current);
      if (renderCount.current > 1) {
        performance.clearMeasures(`${componentName}-render-${renderCount.current}`);
      }
    };
  }, [componentName, trackRenders]);
} 