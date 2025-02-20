# Test Management Application

## Overview

Test Management Application is a comprehensive tool designed to streamline the process of creating, managing, and executing test cases and test suites. It provides a user-friendly interface for testers and QA professionals to efficiently organize their testing efforts.

## Features

- Create and manage projects
- Create, edit, and delete test cases
- View test case history and restore previous versions
- Filter and search test cases
- Pagination for test case lists

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

## Test Case Versioning

The application now supports test case versioning. Each time a test case is updated, a new version is created. Users can view the version history and restore previous versions if needed.

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

- `GET /api/projects/{projectId}/test-cases/{testCaseId}/versions`: Get all versions of a test case
- `POST /api/projects/{projectId}/test-cases/{testCaseId}/restore`: Restore a specific version of a test case

## Development

To run the tests:

```bash
npm test
```

To start the development server:

```bash
npm run dev
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License.

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
