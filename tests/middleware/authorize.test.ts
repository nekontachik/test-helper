import { NextApiResponse } from 'next';
import { authorizeMiddleware } from '../../middleware/authorize';
import { AuthorizationError } from '../../src/lib/errors';
import { AuthenticatedRequest } from '../../middleware/authenticate';

// ... rest of the file remains the same
