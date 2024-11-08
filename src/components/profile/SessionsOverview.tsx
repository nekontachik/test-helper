'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Laptop, Smartphone, Globe } from 'lucide-react';

interface Session {
  id: string;
  deviceType: 'mobile' | 'desktop' | 'other';
  browser: string;
  os: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SessionsOverviewProps {
  currentSessionId: string;
}

export function SessionsOverview({ currentSessionId }: SessionsOverviewProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to revoke session');
      
      setSessions(sessions.filter(session => session.id !== sessionId));
      
      toast({
        title: 'Success',
        description: 'Session revoked successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive',
      });
    }
  };

  const getDeviceIcon = (deviceType: Session['deviceType']) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'desktop':
        return <Laptop className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">Active Sessions</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between py-4 border-b last:border-0"
            >
              <div className="flex items-center space-x-4">
                {getDeviceIcon(session.deviceType)}
                <div>
                  <p className="font-medium">
                    {session.browser} on {session.os}
                    {session.id === currentSessionId && (
                      <span className="ml-2 text-xs text-green-500">
                        (Current)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last active: {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                  </p>
                </div>
              </div>
              {session.id !== currentSessionId && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRevokeSession(session.id)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 