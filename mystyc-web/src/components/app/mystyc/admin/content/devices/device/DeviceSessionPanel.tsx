'use client';

import { DeviceSession } from '@/interfaces';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import AdminDetailGrid from '../../../ui/detail/AdminDetailGrid';

export default function DeviceSessionPanel({ deviceSession }: { deviceSession?: DeviceSession | null }) {
  if (!deviceSession || !deviceSession.session) {
    return <>
      <Heading level={5} className='mb-4'>Device Session</Heading>
      <Text>No data session found</Text>
    </>;
  }

  const formatForDisplay = (timestamp: number): string => {
  if (!timestamp) return "";
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  
  // Calculate time differences
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
    // Build relative time string
    let relativeTime = "";
    if (days > 0) {
      relativeTime = `${days} day${days !== 1 ? 's' : ''}`;
      if (hours > 0) {
        relativeTime += `, ${hours} hour${hours !== 1 ? 's' : ''}`;
      }
    } else if (hours > 0) {
      relativeTime = `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      relativeTime = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    // Format absolute time
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: false 
    });
    const dateStr = date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${relativeTime} (${timeStr} ${dateStr})`;
  };

  return (
    <div>
      <Heading level={5} className='mb-4'>Device Session</Heading>
      <AdminDetailGrid>
        <AdminDetailGroup>
          <AdminDetailField
            label="Session Id"
            value={deviceSession.session.sessionId}
            href={'/admin/sessions/${deviceSession.sessionId}'}
            text={formatForDisplay(deviceSession.session.createdAt)}
          />
          <AdminDetailField
            label="User"
            value={deviceSession.session.email}
            href={'/admin/users/${deviceSession.uid}'}
          />
          <AdminDetailField
            label="Auth Token"
            value={deviceSession.session.authToken}
            text={formatForDisplay(deviceSession.session.authTokenTimestamp)}
          />
          <AdminDetailField
            label="Refresh Token"
            value={deviceSession.session.refreshToken}
            text={formatForDisplay(deviceSession.session.refreshTokenTimestamp)}
          />
          <AdminDetailField
            label="Fcm Token"
            value={deviceSession.session.fcmToken || 'Not set'}
            text={formatForDisplay(deviceSession.session.fcmTokenTimestamp)}
          />
        </AdminDetailGroup>
      </AdminDetailGrid>
    </div>
  );
}