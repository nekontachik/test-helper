import { z } from 'zod';

// Validation schemas
export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'COMPLETED']).optional(),
}); 