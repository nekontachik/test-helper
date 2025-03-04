# Permission Guard Middleware

This directory contains a modular implementation of the permission guard middleware, which handles authorization and permission checks for routes in the application.

## Structure

The middleware is organized into the following modules:

- **index.ts**: Main entry point that re-exports all components
- **types.ts**: Type definitions for permission configurations
- **permissions.ts**: Role-based permission mappings
- **guard.ts**: Core permission guard middleware function
- **helpers.ts**: Utility functions for creating permission guards
- **predefinedGuards.ts**: Common predefined permission guard configurations

## Usage

The permission guard can be used in Next.js middleware or API routes:

```typescript
import { permissionGuard, PermissionGuards } from '@/middleware/permissionGuard';

// In middleware.ts
export async function middleware(request: Request) {
  // Use a predefined guard
  const response = await permissionGuard(request, PermissionGuards.viewProjects);
  if (response) return response;
  
  // Continue with the request
  return NextResponse.next();
}

// Or create a custom guard
const customGuard = {
  roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
  requireVerified: true,
  permissions: [
    { action: Action.CREATE, resource: Resource.PROJECT }
  ]
};

const response = await permissionGuard(request, customGuard);
```

## Features

### Role-Based Access Control

The middleware supports role-based access control with hierarchical roles:

- USER: Basic user with limited permissions
- VIEWER: Can view resources but not modify them
- EDITOR: Can create and edit certain resources
- TESTER: Can execute test runs and manage test cases
- PROJECT_MANAGER: Can manage projects and all related resources
- ADMIN: Has full access to all resources

### Permission Checks

Permissions are checked at multiple levels:

1. **Role-based**: Checks if the user has one of the required roles
2. **Email verification**: Optionally requires verified email
3. **Two-factor authentication**: Optionally requires 2FA
4. **Permission-based**: Checks specific action/resource permissions
5. **Ownership**: Optionally allows ownership-based access

### Predefined Guards

Common permission configurations are available as predefined guards:

- `viewUsers`: Permission to view user information
- `manageUsers`: Permission to manage users (admin only)
- `viewProjects`: Permission to view projects
- `createProject`: Permission to create projects
- `editProject`: Permission to edit projects
- `viewTestCases`: Permission to view test cases
- `createTestCase`: Permission to create test cases
- `adminOnly`: Admin-only access with 2FA requirement

## Customization

You can create custom permission guards using the `createPermissionGuard` helper function:

```typescript
import { createPermissionGuard } from '@/middleware/permissionGuard';
import { Action, Resource } from '@/types/rbac';

const customGuard = createPermissionGuard(Resource.TEST_RUN, Action.EXECUTE, {
  roles: [UserRole.TESTER, UserRole.PROJECT_MANAGER],
  requireVerified: true
});
``` 