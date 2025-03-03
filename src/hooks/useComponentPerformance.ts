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
  const _mountTime = useRef(performance.now());
  
  const markNames = useRef<PerformanceMarks>({
    mount: `${componentName}-mount`,
    render: `${componentName}-render`,
    interaction: `${componentName}-interaction`,
    unmount: `${componentName}-unmount`
  });
  
  // Track mount time
  useEffect(() => {
    const marks = markNames.current;
    const currentRenderCount = renderCount.current;
    
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
          renderCount: currentRenderCount,
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
    
    const marks = markNames.current;
    
    const handleInteraction = (): void => {
      if (!interactionTracked.current) {
        interactionTracked.current = true;
        performance.mark(marks.interaction);
        
        // Measure time to first interaction
        performance.measure(
          `${componentName}-time-to-interaction`,
          marks.mount,
          marks.interaction
        );
        
        if (reportToAnalytics) {
          const interactionMeasures = performance.getEntriesByName(
            `${componentName}-time-to-interaction`,
            'measure'
          );
          
          const measure = interactionMeasures[0];
          if (measure) {
            // Report to analytics
            console.log(`[Analytics] ${componentName} interaction time:`, measure.duration);
          }
        }
      }
    };
    
    document.addEventListener('click', handleInteraction, { capture: true });
    document.addEventListener('keydown', handleInteraction, { capture: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction, { capture: true });
      document.removeEventListener('keydown', handleInteraction, { capture: true });
      
      performance.clearMarks(marks.interaction);
      performance.clearMeasures(`${componentName}-time-to-interaction`);
    };
  }, [componentName, trackInteractions, reportToAnalytics]);
  
  // Track renders if enabled
  useEffect(() => {
    if (!trackRenders) return;
    
    const marks = markNames.current;
    const currentRenderCount = renderCount.current;
    
    renderCount.current++;
    const newRenderCount = renderCount.current;
    performance.mark(marks.render + newRenderCount);
    
    if (newRenderCount > 1) {
      // Measure time between renders
      performance.measure(
        `${componentName}-render-${newRenderCount}`,
        marks.render + (newRenderCount - 1),
        marks.render + newRenderCount
      );
      
      const measures = performance.getEntriesByName(`${componentName}-render-${newRenderCount}`);
      const lastMeasure = measures[measures.length - 1];
      
      if (newRenderCount % 5 === 0) {
        console.debug(`Render count: ${componentName}`, {
          renderCount: newRenderCount,
          lastRenderDuration: lastMeasure?.duration || 0
        });
      }
    }
    
    return () => {
      performance.clearMarks(marks.render + newRenderCount);
      if (currentRenderCount > 0) {
        performance.clearMeasures(`${componentName}-render-${newRenderCount}`);
      }
    };
  }, [componentName, trackRenders]);
} 