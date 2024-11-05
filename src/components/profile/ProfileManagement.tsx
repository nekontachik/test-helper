'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProfileInformation } from './ProfileInformation';
import { SecuritySettings } from './SecuritySettings';
import { SessionsOverview } from './SessionsOverview';
import { ActivityLog } from './ActivityLog';
import { AuthUser } from '@/types/auth';

interface ProfileManagementProps {
  user: AuthUser;
  currentSessionId: string;
}

export function ProfileManagement({ user, currentSessionId }: ProfileManagementProps) {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile">
            <ProfileInformation user={user} />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings user={user} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionsOverview currentSessionId={currentSessionId} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog userId={user.id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 