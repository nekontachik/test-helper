import type { IconType } from 'react-icons';
import type { UserRole } from '@/types/auth';
import type { ApiErrorCode } from '@/lib/errors/types';

export interface StatData {
  title: string;
  stat: string | number;
  icon: IconType;
  colorScheme: string;
  helpText?: string;
}

export interface QuickAction {
  label: string;
  icon: IconType;
  href: string;
  colorScheme: string;
  requiredRoles?: UserRole[];
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  testCaseCount: number;
  testRunCount: number;
  progress: number;
}

export type ActionHandler = (path: string) => void;

export interface DashboardError {
  code: ApiErrorCode;
  message: string;
  details?: string;
}

export interface DashboardProps {
  onNavigate?: ActionHandler;
  onError?: (error: DashboardError) => void;
} 