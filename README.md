# Testing Buddy

## Overview
![testing buddy](https://github.com/user-attachments/assets/7337eb61-80c9-417d-989a-2bebc051de2c)

Testing Buddy is a comprehensive tool designed to streamline the process of creating, managing, and executing test cases and test suites. It provides a user-friendly interface for testers and QA professionals to efficiently organize their testing efforts.

## Recent Fixes and Improvements

- **Logger Imports**: Updated all logger imports to use named imports for better consistency
- **Type Errors**: Fixed TypeScript errors in core application files
- **UI Improvements**: 
  - Fixed header layout and profile display issues
  - Updated Test Cases icon in sidebar for better visual representation
- **Code Quality**: Resolved linting issues across the codebase
- **Documentation**: Added a comprehensive release checklist

## Features

- **Project Management**: Create and manage testing projects
- **Test Case Management**: Create, edit, and delete test cases with detailed steps and expected results
- **Version Control**: View test case history and restore previous versions
- **Search & Filter**: Advanced filtering and search capabilities for test cases
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Navigation**: Improved accessibility with keyboard shortcuts
- **Dark Mode**: Support for light and dark themes

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Libraries**: Chakra UI, Shadcn UI, Radix UI, Tailwind CSS
- **State Management**: React Query, Context API
- **Authentication**: NextAuth.js, Supabase Auth
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/test-management-app.git
   cd test-management-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration values.

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Workflow

### Code Structure

- `/src/app`: Next.js App Router pages and layouts
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and services
- `/src/hooks`: Custom React hooks
- `/src/types`: TypeScript type definitions
- `/prisma`: Database schema and migrations

### Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Fix ESLint issues
- `npm run format`: Format code with Prettier
- `npm run type-check`: Check TypeScript types
- `npm run test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report

## Deployment

### Staging

To deploy to the staging environment:

```bash
npm run deploy:staging
```

### Production

To deploy to the production environment:

```bash
npm run deploy:production
```

## Test Case Versioning

The application supports test case versioning. Each time a test case is updated, a new version is created. Users can view the version history and restore previous versions if needed.

### Viewing Version History

To view the version history of a test case:

1. Navigate to the test case details page
2. Scroll down to the "Version History" section
3. Click on a version to view its details

### Restoring a Previous Version

To restore a previous version of a test case:

1. Navigate to the test case details page
2. Scroll down to the "Version History" section
3. Click on the version you want to restore
4. In the version details modal, click "Restore This Version"

## API Endpoints

The application provides a RESTful API for interacting with test cases and projects:

### Projects

- `GET /api/projects`: Get all projects
- `GET /api/projects/{projectId}`: Get a specific project
- `POST /api/projects`: Create a new project
- `PUT /api/projects/{projectId}`: Update a project
- `DELETE /api/projects/{projectId}`: Delete a project

### Test Cases

- `GET /api/projects/{projectId}/test-cases`: Get all test cases for a project
- `GET /api/projects/{projectId}/test-cases/{testCaseId}`: Get a specific test case
- `POST /api/projects/{projectId}/test-cases`: Create a new test case
- `PUT /api/projects/{projectId}/test-cases/{testCaseId}`: Update a test case
- `DELETE /api/projects/{projectId}/test-cases/{testCaseId}`: Delete a test case
- `GET /api/projects/{projectId}/test-cases/{testCaseId}/versions`: Get all versions of a test case
- `POST /api/projects/{projectId}/test-cases/{testCaseId}/restore`: Restore a specific version of a test case

## Accessibility

The application is designed with accessibility in mind:

- Keyboard navigation support
- ARIA attributes for screen readers
- Color contrast compliance
- Focus management for modals and dialogs

## Performance Optimization

- Server-side rendering for initial page load
- Code splitting for reduced bundle size
- Image optimization
- Caching strategies for API responses

## Security

- Input validation using Zod schemas
- CSRF protection
- Rate limiting for API endpoints
- Content Security Policy headers
- XSS protection

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Chakra UI](https://chakra-ui.com/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query/latest)

## Technical Architecture

### Provider Setup
The application uses a well-structured provider hierarchy with Chakra UI v2.8.0 (latest stable version compatible with Next.js 13+):

#### Provider Structure
- Uses the official Chakra UI types from @chakra-ui/react@2.8.0
- Maintains a single source of truth for providers
- Follows Next.js 13+ app directory best practices
- Implements provider order: React Query -> NextAuth -> Chakra UI

#### Chakra UI Integration
- Version: 2.8.0 (stable, Next.js 13+ compatible)
- Dependencies:
  - @chakra-ui/react@2.8.0
  - @chakra-ui/next-js@2.1.5
  - @emotion/react@11.11.1
  - @emotion/styled@11.11.0
  - framer-motion@10.16.4

#### Key Features
- Server-side rendering support
- Type-safe component props
- Responsive design utilities
- Custom theme support
- Performance optimized

## New Features

### Keyboard Navigation

The application now supports keyboard navigation for better accessibility. In the Test Case List:
- Use the up and down arrow keys to navigate between test cases.
- Press Enter to view the details of the selected test case.

### Improved Loading States

We've implemented skeleton loading states to improve the user experience while data is being fetched.

### Enhanced Error Handling and Logging

The application now has more robust error handling and logging, providing better diagnostics and user feedback.

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your environment variables in a `.env` file
4. Run the development server: `npm run dev`

## New Features

- Improved error handling across all API routes
- Input validation using Zod schemas
- Updated frontend components to handle new error responses

## Usage

[Add any new usage instructions here]

# Chakra UI Components Usage Guide

## Setup
We use Chakra UI v2.8.0 for our component library. The setup includes:
- Core Chakra UI package (@chakra-ui/react)
- Theme customization
- Provider configuration

## Component Usage

### Basic Components

## Directory Structure

All source code should be placed in the `/src` directory:
- App code goes in `/src/app`
- Components go in `/src/components`
- Library code goes in `/src/lib`

❌ Do not create files in the root `/app` directory - use `/src/app` instead.
