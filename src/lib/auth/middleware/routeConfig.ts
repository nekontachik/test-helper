import { ROUTES } from '@/config/routes';
import type { RouteConfig, ApiRouteConfig, WebRouteConfig } from './types';

// Cache for route pattern matching
const routePatternCache = new Map<string, { pattern: string, config: RouteConfig }>();

/**
 * Check if a path is for a static file
 * @param pathname - Path to check
 * @returns boolean indicating if path is for a static file
 */
export function isStaticFile(pathname: string): boolean {
  return Boolean(pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/));
}

/**
 * Get route configuration for a given path
 * @param pathname - URL path to check
 * @returns Route configuration
 */
export function getRouteConfig(pathname: string): RouteConfig {
  // Check cache first
  if (routePatternCache.has(pathname)) {
    const cached = routePatternCache.get(pathname);
    return cached!.config;
  }
  
  // Check public routes
  for (const [pattern, routeConfig] of Object.entries(ROUTES.public)) {
    if (new RegExp(`^${pattern}$`).test(pathname)) {
      const config = { 
        ...routeConfig,
        requireAuth: false, 
        isPublic: true 
      } as RouteConfig;
      
      // Cache the result
      routePatternCache.set(pathname, { pattern, config });
      return config;
    }
  }
  
  // Check API routes
  if (pathname.startsWith('/api/')) {
    for (const [pattern, routeConfig] of Object.entries(ROUTES.api)) {
      if (new RegExp(`^${pattern}$`).test(pathname)) {
        const config = { 
          ...routeConfig,
          requireAuth: true, 
          isApi: true 
        } as ApiRouteConfig;
        
        // Cache the result
        routePatternCache.set(pathname, { pattern, config });
        return config;
      }
    }
  }
  
  // Check web routes
  for (const [pattern, routeConfig] of Object.entries(ROUTES.web)) {
    if (new RegExp(`^${pattern}$`).test(pathname)) {
      const config = { 
        ...routeConfig,
        requireAuth: true, 
        isWeb: true 
      } as WebRouteConfig;
      
      // Cache the result
      routePatternCache.set(pathname, { pattern, config });
      return config;
    }
  }
  
  // Default to requiring authentication
  const defaultConfig = pathname.startsWith('/api/') 
    ? { requireAuth: true, isApi: true } as ApiRouteConfig
    : { requireAuth: true, isWeb: true } as WebRouteConfig;
  
  routePatternCache.set(pathname, { pattern: '', config: defaultConfig });
  return defaultConfig;
}

/**
 * Clear the route pattern cache
 * Useful for testing or when routes change dynamically
 */
export function clearRouteCache(): void {
  routePatternCache.clear();
} 