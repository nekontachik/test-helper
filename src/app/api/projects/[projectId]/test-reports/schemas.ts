import { z } from 'zod';

// Validation schemas
export const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional() 
}).transform(data => ({
  ...data,
  // Pre-transform search term for case-insensitive search
  search: data.search?.toLowerCase() 
}));

export const paramsSchema = z.object({
  projectId: z.string().uuid() 
});

export const createSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  content: z.string().min(1).trim(),
  attachments: z.array(z.string().url()).optional() 
});

// Reusable select objects for better performance and maintainability
export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

export const projectSelect = {
  id: true,
  name: true,
  // Add other project fields as needed
} as const; 