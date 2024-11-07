'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@chakra-ui/react';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Laptop, Smartphone, Globe } from 'lucide-react';

interface Device {
  id: string;
  deviceType: 'mobile' | 'desktop' | 'other';
  browser: string;
  os: string;
  lastActive: string;
  isCurrent: boolean;
}

export function SessionDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (!response.ok) throw new Error('Failed to fetch devices');
      const data = await response.json();
      setDevices(data.devices);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load active sessions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${deviceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to revoke session');
      
      setDevices(devices.filter(device => device.id !== deviceId));
      
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

  const getDeviceIcon = (deviceType: Device['deviceType']) => {
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
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Active Sessions</h3>
      <div className="divide-y">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between py-4"
          >
            <div className="flex items-center space-x-4">
              {getDeviceIcon(device.deviceType)}
              <div>
                <p className="font-medium">
                  {device.browser} on {device.os}
                  {device.isCurrent && (
                    <span className="ml-2 text-xs text-green-500">
                      (Current)
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last active: {new Date(device.lastActive).toLocaleString()}
                </p>
              </div>
            </div>
            {!device.isCurrent && (
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => handleRevokeSession(device.id)}
              >
                Revoke
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 