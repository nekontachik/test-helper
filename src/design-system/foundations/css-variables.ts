/**
 * Utility to convert design tokens to CSS variables
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacingSystem } from './spacing';
import { breakpoints } from './breakpoints';

/**
 * Converts a nested object to CSS variables
 * @param obj - The object to convert
 * @param prefix - The prefix for the variable names
 * @returns An object with CSS variable definitions
 */
function objectToCssVars(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const varName = prefix ? `${prefix}-${key}` : key;
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects
      const nestedVars = objectToCssVars(value as Record<string, unknown>, varName);
      Object.assign(result, nestedVars);
    } else {
      // Add the CSS variable
      result[`--${varName}`] = String(value);
    }
  });
  
  return result;
}

/**
 * Generates CSS variables for colors
 */
export const colorCssVars = objectToCssVars(colors, 'color');

/**
 * Generates CSS variables for typography
 */
export const typographyCssVars = objectToCssVars(typography, 'typography');

/**
 * Generates CSS variables for spacing
 */
export const spacingCssVars = objectToCssVars(spacingSystem, 'spacing');

/**
 * Generates CSS variables for breakpoints
 */
export const breakpointCssVars = objectToCssVars(breakpoints.values, 'breakpoint');

/**
 * Combines all CSS variables
 */
export const allCssVars = {
  ...colorCssVars,
  ...typographyCssVars,
  ...spacingCssVars,
  ...breakpointCssVars,
};

/**
 * Generates a CSS string with all variables
 */
export function generateCssVariables(): string {
  let cssString = ':root {\n';
  
  Object.entries(allCssVars).forEach(([name, value]) => {
    cssString += `  ${name}: ${value};\n`;
  });
  
  cssString += '}\n\n';
  
  // Add dark mode variables
  cssString += '.dark {\n';
  
  // Add dark mode specific variables
  Object.entries(colorCssVars).forEach(([name, value]) => {
    if (name.includes('color-theme-dark')) {
      // Convert color-theme-dark-background to color-theme-background
      const lightName = name.replace('color-theme-dark', 'color-theme');
      cssString += `  ${lightName}: ${value};\n`;
    }
  });
  
  cssString += '}\n';
  
  return cssString;
} 