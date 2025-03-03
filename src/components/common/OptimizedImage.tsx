'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ImageProps } from 'next/image';
import { Box, Skeleton } from '@chakra-ui/react';
import type { ResponsiveValue } from '@chakra-ui/react';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoadingComplete'> {
  fallback?: React.ReactNode;
  trackPerformance?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallback,
  trackPerformance = true,
  priority = false,
  ...props
}: OptimizedImageProps): JSX.Element {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Convert width/height to proper Chakra types
  const boxWidth: ResponsiveValue<string | number> = width ? width : 'auto';
  const boxHeight: ResponsiveValue<string | number> = height ? height : 'auto';
  
  // Track image loading performance
  useEffect(() => {
    if (trackPerformance && isLoaded && loadTime) {
      // Log image loading performance
      console.debug(`Image loaded: ${alt || 'unnamed image'}`, {
        loadTimeMs: loadTime,
        src: typeof src === 'string' ? src : 'object',
        width,
        height,
        priority
      });
      
      // Report to analytics if needed
      // analytics.trackImagePerformance({...})
    }
  }, [isLoaded, loadTime, src, alt, width, height, priority, trackPerformance]);
  
  // Handle loading start time
  const startTime = performance.now();
  
  if (error) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Box 
        width={boxWidth} 
        height={boxHeight} 
        bg="gray.100" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Box as="span" fontSize="sm" color="gray.500">
          Failed to load image
        </Box>
      </Box>
    );
  }
  
  return (
    <>
      {!isLoaded && !priority && (
        <Skeleton 
          width={boxWidth} 
          height={boxHeight} 
          startColor="gray.100" 
          endColor="gray.300"
        />
      )}
      <Box 
        position="relative" 
        width={boxWidth} 
        height={boxHeight}
        display={isLoaded ? 'block' : 'none'}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          onLoadingComplete={() => {
            setIsLoaded(true);
            setLoadTime(performance.now() - startTime);
          }}
          onError={(e) => {
            setError(new Error('Failed to load image'));
            console.error('Image load error:', e);
          }}
          {...props}
        />
      </Box>
    </>
  );
} 