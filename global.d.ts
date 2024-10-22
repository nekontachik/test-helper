import '@testing-library/jest-dom/extend-expect';
import { expect as jestExpect } from '@jest/globals';

declare global {
  namespace NodeJS {
    interface Global {
      expect: typeof jestExpect;
    }
  }
}

declare module 'next' {
  export * from 'next/types/index';
}

declare module 'react' {
  export * from 'react';
}

/// <reference types="react" />
/// <reference types="react-dom" />

// Remove or comment out the following lines:
// declare module '@/app/api/projects/[projectId]/test-runs/[testRunId]/results/route' {
//   import { NextApiHandler } from 'next';
//   export const GET: NextApiHandler;
//   export const POST: NextApiHandler;
// }

// Instead, you can add type declarations for other modules or global types here if needed.

// Remove or comment out the following lines:
// declare module '@/pages/api/projects/[projectId]' {
//   import { NextApiHandler } from 'next';
//   const handler: NextApiHandler;
//   export default handler;
// }

// Keep other type declarations as needed

export {};
