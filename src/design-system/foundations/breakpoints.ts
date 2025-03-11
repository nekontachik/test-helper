/**
 * Breakpoints for responsive design
 * These are used to create consistent responsive layouts
 */

// Breakpoint values (in px)
export const values = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 640,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 1024,   // Large devices (desktops)
  xl: 1280,   // Extra large devices (large desktops)
  '2xl': 1536, // Extra extra large devices
};

// Media query strings for use in styled components or CSS-in-JS
export const mediaQueries = {
  xs: `@media (min-width: ${values.xs}px)`,
  sm: `@media (min-width: ${values.sm}px)`,
  md: `@media (min-width: ${values.md}px)`,
  lg: `@media (min-width: ${values.lg}px)`,
  xl: `@media (min-width: ${values.xl}px)`,
  '2xl': `@media (min-width: ${values['2xl']}px)`,
};

// Helper function to get a media query string for a custom breakpoint
export function up(breakpoint: number): string {
  return `@media (min-width: ${breakpoint}px)`;
}

// Helper function to get a media query string for a range between breakpoints
export function between(min: number, max: number): string {
  return `@media (min-width: ${min}px) and (max-width: ${max - 0.02}px)`;
}

// Helper function to get a media query string for screens below a breakpoint
export function down(breakpoint: number): string {
  return `@media (max-width: ${breakpoint - 0.02}px)`;
}

// Export all breakpoint utilities as a single object
export const breakpoints = {
  values,
  mediaQueries,
  up,
  down,
  between,
}; 