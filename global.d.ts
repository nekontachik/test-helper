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

export {};
