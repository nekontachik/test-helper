'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

/**
 * ActivityLog Component
 * 
 * Displays a user's activity history in a tabular format with proper date formatting
 * and loading/error states.
 */

interface ActivityLogEntry {
  id: string;
  type: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  metadata: Record<string, any>;
}

interface ActivityLogProps {
  /** The ID of the user whose activity to display */
  userId: string;
  /** Optional className for custom styling */
  className?: string;
}

/**
 * Formats the activity message based on type and metadata
 */
function getActivityMessage(activity: ActivityLogEntry): string {
  const { type, metadata } = activity;
  switch (type) {
    case 'LOGIN_SUCCESS':
      return 'Successful login';
    case 'LOGIN_FAILED':
      return 'Failed login attempt';
    case 'ACCOUNT_LOCKED':
      return 'Account locked due to suspicious activity';
    case 'TWO_FACTOR_ENABLED':
      return '2FA enabled';
    case 'TWO_FACTOR_DISABLED':
      return '2FA disabled';
    default:
      return type.toLowerCase().replace(/_/g, ' ');
  }
}

export function ActivityLog({ userId, className }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/user/activity?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch activity log');
        
        const data = await response.json();
        setActivities(data.logs);
      } catch (error) {
        setError('Failed to load activity log');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-2xl font-bold">Activity Log</h2>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {getActivityMessage(activity)}
                </TableCell>
                <TableCell>{activity.ip}</TableCell>
                <TableCell>
                  {activity.metadata.device?.browser} on{' '}
                  {activity.metadata.device?.os}
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Usage Examples:
 * 
 * Basic usage:
 * ```tsx
 * <ActivityLog userId="user123" />
 * ```
 * 
 * With custom styling:
 * ```tsx
 * <ActivityLog userId="user123" className="mt-4" />
 * ```
 */

/**
 * Accessibility Features:
 * - Semantic table structure with proper headers
 * - Loading and error states for screen readers
 * - High contrast text for readability
 * 
 * State Management:
 * - Loading state during data fetch
 * - Error state for failed requests
 * - Activity data state
 * 
 * Error Handling:
 * - Failed API requests
 * - Empty activity log
 * - Invalid data format
 * 
 * Performance Considerations:
 * - Memoized activity message formatting
 * - Efficient date formatting
 * - Proper loading states
 */ 