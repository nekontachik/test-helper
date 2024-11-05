# Authentication and Authorization System

## Role System

The application uses a role-based access control (RBAC) system with the following roles:

- USER: Basic user with limited access
- TESTER: Can create and manage test cases
- PROJECT_MANAGER: Can manage projects and test cases
- ADMIN: Has full access to all features

### Role Definitions

Role definitions and permissions are maintained in:
- `src/lib/constants/auth.ts`: Runtime constants and validation
- `src/types/auth.ts`: TypeScript type definitions
- `prisma/schema.prisma`: Database schema (using string field with validation)

### Role Hierarchy

1. USER (Level 0)
2. TESTER (Level 1)
3. PROJECT_MANAGER (Level 2)
4. ADMIN (Level 3)

### Permission System

Permissions are defined as combinations of:
- Actions: create, read, update, delete
- Resources: project, testCase, testRun, report

See `src/lib/constants/auth.ts` for the complete permission mapping.

## Usage

```typescript
import { USER_ROLES, isValidRole } from '@/lib/constants/auth';

// Checking role validity
const isValid = isValidRole(someRole);

// Using role constants
const defaultRole = USER_ROLES.USER;
```

## Database Considerations

Since SQLite doesn't support enums, roles are stored as strings in the database.
The application enforces role validity through:
1. Application-level validation
2. Default values in the database
3. TypeScript type checking

## Adding New Roles

To add a new role:
1. Add it to USER_ROLES in `src/lib/constants/auth.ts`
2. Update ROLE_HIERARCHY and ROLE_PERMISSIONS
3. Update TypeScript types in `src/types/auth.ts`
4. Document the new role in this README 