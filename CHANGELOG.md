# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New `useErrorHandler` hook for centralized error handling
- Test file for `useErrorHandler` hook
- Enhanced error logging in ErrorBoundary component
- Created `Header` and `Footer` components
- Added `ProjectCard` component for displaying project information
- Extended Chakra UI type definitions to include `Badge` and update `ChakraProvider`

### Changed

- Updated `tsconfig.json` to include necessary libraries and configurations
- Modified `types/api.ts` to include new types for error handling
- Updated `pages/api/projects/index.ts` to use new error handling approach
- Refactored `types/prisma-extensions.d.ts` to include more specific Prisma types
- Updated test files to use proper React and testing-library imports
- Refactored component files to use correct import statements and JSX syntax
- Improved logger configuration for more detailed error reporting
- Updated tsconfig.json with necessary compiler options
- Refactored `components/TestCaseList.tsx` to use Chakra UI components and fix type issues
- Updated `components/Layout.tsx` to use Chakra UI components and improve TypeScript types
- Refactored `components/ProjectList.tsx` to use Chakra UI components and fix type issues
- Updated hook test files (`useProjects`, `useTestCases`, `useTestRuns`) to pass correct arguments
- Refactored `ErrorBoundary` component to use Chakra UI components
- Updated `LoadingSpinner` component to use Chakra UI Spinner
- Updated `Layout` component to use new `Header` and `Footer` components
- Refactored `ProjectList` component to use `ProjectCard`
- Modified `_app.tsx` to properly type `ChakraProvider`
- Updated database configuration to use SQLite instead of PostgreSQL

### Fixed

- Resolved type conflicts in `useErrorHandler` hook
- Fixed JSX-related issues in test files
- Corrected Prisma schema and type definitions to align with project structure
- Resolved import and JSX syntax issues in multiple test and component files
- Resolved type errors in various components by updating Chakra UI type definitions

### Removed

- Deprecated `@testing-library/react-hooks` in favor of `@testing-library/react`

### Development

- Updated Jest configuration to support new testing structure
- Improved error messages in `constants/errorMessages.ts`

## [Unreleased]

- Renamed test files from .ts to .tsx
- Updated test files to import React and use proper JSX syntax
- Updated tsconfig.json to support JSX
