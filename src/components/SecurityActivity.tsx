'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Shield, UserMinus } from 'lucide-react';
import { ActivityType } from '@/lib/auth/activityService';

interface ActivityLog {
  id: string;
  type: ActivityType;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export function SecurityActivity(): JSX.Element {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/activity');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data = await response.json();
      setActivities(data.activities);
    } catch (error: unknown) {
      console.error('Failed to fetch security activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType): JSX.Element => {
    switch (type) {
      case ActivityType.LOGIN_FAILED:
      case ActivityType.ACCOUNT_LOCKED:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case ActivityType.LOGIN_SUCCESS:
      case ActivityType.TWO_FACTOR_ENABLED:
        return <Shield className="h-4 w-4 text-green-500" />;
      default:
        return <UserMinus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: ActivityLog): string => {
    switch (activity.type) {
      case ActivityType.LOGIN_SUCCESS:
        return 'Successful login';
      case ActivityType.LOGIN_FAILED:
        return 'Failed login attempt';
      case ActivityType.ACCOUNT_LOCKED:
        return 'Account locked due to suspicious activity';
      case ActivityType.TWO_FACTOR_ENABLED:
        return '2FA enabled';
      case ActivityType.TWO_FACTOR_DISABLED:
        return '2FA disabled';
      default:
        return activity.type.toLowerCase().replace(/_/g, ' ');
    }
  };

  if (isLoading) {
    return <div>Loading security activity...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Security Activity</h3>
      <div className="divide-y">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-4 py-3"
          >
            {getActivityIcon(activity.type)}
            <div className="flex-1">
              <p className="font-medium">
                {getActivityMessage(activity)}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(activity.createdAt), 'PPpp')}
                {activity.ip && ` from ${activity.ip}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 