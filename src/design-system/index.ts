/**
 * Design System
 * This file exports all elements of the design system
 */

// Export foundations
export * from './foundations';

// Export static components
export * as Components from './components';

// Export static layouts
export * as Layouts from './layouts';

// Export dynamic components (code-split)
export * from './dynamic';

// Export theme provider
export { DesignSystemProvider, useDesignSystem } from './ThemeProvider';
export type { ThemeMode } from './ThemeProvider'; 