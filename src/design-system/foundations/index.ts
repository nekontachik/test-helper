/**
 * Design System Foundations
 * This file exports all foundation elements of the design system
 */

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './breakpoints';

// Export a combined theme object with all foundations
import { colors } from './colors';
import { typography } from './typography';
import { spacingSystem } from './spacing';
import { breakpoints } from './breakpoints';

export const theme = {
  colors,
  typography,
  spacing: spacingSystem,
  breakpoints,
}; 