/**
 * Dynamic imports for design system components
 * This allows for code splitting and reduces the initial bundle size
 */

import dynamic from 'next/dynamic';

// Use a simple loading placeholder
const Loading = (): null => null;

/**
 * Dynamically import the Button component
 */
export const Button = dynamic(
  () => import('./components/Button').then((mod) => mod.Button),
  {
    loading: Loading,
    ssr: true,
  }
);

/**
 * Dynamically import the Card components
 */
export const Card = dynamic(
  () => import('./components/Card').then((mod) => mod.Card),
  {
    loading: Loading,
    ssr: true,
  }
);

export const CardHeader = dynamic(
  () => import('./components/Card').then((mod) => mod.CardHeader),
  {
    loading: Loading,
    ssr: true,
  }
);

export const CardTitle = dynamic(
  () => import('./components/Card').then((mod) => mod.CardTitle),
  {
    loading: Loading,
    ssr: true,
  }
);

export const CardDescription = dynamic(
  () => import('./components/Card').then((mod) => mod.CardDescription),
  {
    loading: Loading,
    ssr: true,
  }
);

export const CardContent = dynamic(
  () => import('./components/Card').then((mod) => mod.CardContent),
  {
    loading: Loading,
    ssr: true,
  }
);

export const CardFooter = dynamic(
  () => import('./components/Card').then((mod) => mod.CardFooter),
  {
    loading: Loading,
    ssr: true,
  }
);

/**
 * Dynamically import the layout components
 */
export const Container = dynamic(
  () => import('./layouts/Container').then((mod) => mod.Container),
  {
    loading: Loading,
    ssr: true,
  }
);

export const Grid = dynamic(
  () => import('./layouts/Grid').then((mod) => mod.Grid),
  {
    loading: Loading,
    ssr: true,
  }
);

export const GridItem = dynamic(
  () => import('./layouts/Grid').then((mod) => mod.GridItem),
  {
    loading: Loading,
    ssr: true,
  }
); 