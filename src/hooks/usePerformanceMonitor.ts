import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef(performance.now());

  useEffect(() => {
    const endTime = performance.now();
    console.log(
      `${componentName} render time: ${endTime - startTime.current}ms`
    );
  });
};
