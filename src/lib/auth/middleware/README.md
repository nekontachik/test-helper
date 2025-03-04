# Authentication Middleware

This directory contains a modular authentication middleware implementation for Next.js applications. The middleware handles authentication, authorization, rate limiting, and request logging.

## Structure

The middleware is organized into the following modules:

- **index.ts**: Main entry point that orchestrates all middleware components
- **types.ts**: Type definitions for tokens, route configurations, etc.
- **config.ts**: Configuration settings for the middleware
- **routeConfig.ts**: Route configuration and pattern matching
- **tokenUtils.ts**: JWT token handling utilities
- **roleCheck.ts**: Role-based access control utilities
- **rateLimit.ts**: Rate limiting implementation
- **responseHandler.ts**: Response handling utilities for different scenarios

## Usage

The middleware can be used in Next.js API routes as follows:

```typescript
import { authMiddleware } from '@/lib/auth/middleware';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await authMiddleware(req, res, async () => {
    // Your route handler logic here
    // The user is authenticated at this point
    // Access user data via (req as any).user
    
    res.status(200).json({ success: true });
  });
}
```

## Route Configuration

Routes are configured in the `ROUTES` object in `@/config/routes.ts`. Each route can specify:

- Authentication requirements
- Required user roles
- Email verification requirements
- Two-factor authentication requirements
- Rate limiting settings

## Customization

The middleware can be customized by modifying the configuration in `config.ts` or by extending the individual modules as needed. 