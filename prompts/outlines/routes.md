# Authentication Routes

## /api/auth/[...nextauth]/route.ts
- NextAuth configuration and handlers
- Session management
- OAuth providers setup (Google, GitHub)
- Credentials provider with email/password
- JWT callbacks and session handling

## /api/auth/register/route.ts 
- New user registration endpoint
- Password hashing
- Email validation
- User creation in database
- Error handling for duplicate emails

## /auth/signin/page.tsx
- Sign in form UI
- OAuth provider buttons
- Form validation
- Error handling
- Loading states

## /auth/error/page.tsx
- Error page for auth failures
- Different error states:
  - OAuth errors
  - Invalid credentials
  - Account exists
  - Access denied
- Error messages and recovery options

# Protected Routes
- Route protection with middleware
- Role-based access control
- Session validation
- Redirect handling for unauthenticated users
