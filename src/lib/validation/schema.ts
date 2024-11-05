import { z } from 'zod';

// Common validation rules
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Base schemas
export const idSchema = z.string().cuid();
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8).max(100);
export const dateSchema = z.coerce.date();
export const urlSchema = z.string().url();

// File validation schemas
export const imageSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 5MB'),
  type: z.enum(ALLOWED_IMAGE_TYPES as [string, ...string[]]),
});

export const documentSchema = z.object({
  size: z.number().max(MAX_FILE_SIZE, 'File size must be less than 5MB'),
  type: z.enum(ALLOWED_DOCUMENT_TYPES as [string, ...string[]]),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z.record(z.string()).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
});

// Common validation functions
export function validateId(id: unknown): string {
  return idSchema.parse(id);
}

export function validateEmail(email: unknown): string {
  return emailSchema.parse(email);
}

export function validatePagination(query: unknown) {
  return paginationSchema.parse(query);
}

export function validateSearch(query: unknown) {
  return searchSchema.parse(query);
} 