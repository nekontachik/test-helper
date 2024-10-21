# Project Structure

This document outlines the agreed-upon structure for our Test Management Application. All team members should follow this structure when creating new files or modifying existing ones.

## Directory Structure

test-helper/
├── src/
│ ├── components/
│ │ └── ... (React components)
│ ├── hooks/
│ │ └── ... (Custom React hooks)
│ ├── lib/
│ │ ├── apiClient.ts
│ │ ├── prisma.ts
│ │ └── ... (Other utility files)
│ └── types.ts
├── app/
│ ├── api/
│ │ └── ... (API routes)
│ └── ... (Next.js 13+ app directory structure)
├── public/
│ └── ... (Static files)
├── prisma/
│ └── ... (Prisma schema and migrations)
├── tests/
│ └── ... (Test files)
├── .github/
│ └── workflows/
│ └── ... (GitHub Actions workflow files)
├── .env
├── .env.example
├── next.config.js
├── package.json
├── README.md
├── STRUCTURE.md
└── tsconfig.json

## Key Directories and Their Purposes

- `src/`: Contains the source code for the application
  - `components/`: React components used throughout the application
  - `hooks/`: Custom React hooks for data fetching and state management
  - `lib/`: Utility functions and modules, including API client and Prisma instance
  - `types.ts`: TypeScript type definitions used across the project
- `app/`: Contains the Next.js 13+ app directory structure for routing and pages
  - `api/`: API routes for the application
- `public/`: Static files served by Next.js
- `prisma/`: Prisma schema and database migrations
- `tests/`: Test files for components, hooks, and other modules
- `.github/workflows/`: GitHub Actions workflow files for CI/CD

## Naming Conventions

- Use PascalCase for component files: `TestRunList.tsx`
- Use camelCase for hook files: `useTestRuns.ts`
- Use kebab-case for multi-word directory names: `test-runs/`

## Import Conventions

- Use absolute imports with the `@/` alias for imports from the `src/` directory
  Example: `import { apiClient } from '@/lib/apiClient';`

## File Location Guidelines

- All React components should be placed in `src/components/`
- All custom hooks should be placed in `src/hooks/`
- All API routes should be placed in `app/api/`
- All page components should be placed in the appropriate directory under `app/`

## Best Practices

- Keep components small and focused on a single responsibility
- Use custom hooks to encapsulate complex logic and data fetching
- Keep API route handlers in separate files under the `app/api/` directory
- Use TypeScript for all new files to ensure type safety

Remember to update this document as the project structure evolves or new conventions are adopted.
