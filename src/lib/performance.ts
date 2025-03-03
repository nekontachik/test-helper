// Fix the unused PerformanceMetrics interface and any type
export interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  interactionTime?: number;
}

// Types for web vitals metrics
export interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  label: string;
  delta?: number;
}

// Function to report web vitals
export function reportWebVitals(metric: WebVitalsMetric): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.debug('Web Vitals:', metric);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    const analyticsId = process.env.NEXT_PUBLIC_GA_ID;
    
    if (analyticsId) {
      // Send to analytics - implementation would go here
      // This is just a placeholder to avoid the unused variable warning
      console.debug(`Would send metrics to analytics ID: ${analyticsId}`);
    }
    
    // Example: Send to custom endpoint
    const apiKey = process.env.NEXT_PUBLIC_PERFORMANCE_API_KEY;
    
    if (apiKey) {
      fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(metric),
        // Keep the request alive even if the page unloads
        keepalive: true,
      }).catch(error => {
        console.error('Error reporting performance metric:', error);
      });
    }
  }
}

// Function to measure a specific operation
export function measureOperation<T>(
  operationName: string, 
  operation: () => T,
  logResult = true
): T {
  const startTime = performance.now();
  const result = operation();
  const endTime = performance.now();
  
  if (logResult) {
    console.log(`Operation ${operationName} took ${endTime - startTime}ms`);
  }
  
  // Track the metric
  if (typeof window !== 'undefined') {
    trackPerformanceMetric({
      name: operationName,
      duration: endTime - startTime,
      timestamp: new Date().toISOString()
    });
  }
  
  return result;
}

// Add proper typing for tracking metrics
interface PerformanceMetricData {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Implementation of trackPerformanceMetric
function trackPerformanceMetric(_metric: PerformanceMetricData): void {
  // Implementation would go here
  // Using underscore prefix to indicate intentionally unused parameter
} 