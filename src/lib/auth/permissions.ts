import { Permission } from '@/types/auth';
import { MOCK_USER } from './simpleAuth';

export function hasPermission(permission: string): boolean {
  // Admin has all permissions
  if (MOCK_USER.role === 'ADMIN') return true;
  
  // Check specific permission
  return MOCK_USER.permissions.some(p => p.name === permission);
}

export function checkPermissions(requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => hasPermission(permission));
} 