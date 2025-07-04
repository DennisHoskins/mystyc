'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { DeviceSession } from '@/interfaces';
import { useBusy, useToast } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import DeviceIcon from '@/components/app/mystyc/admin/ui/icons/DeviceIcon';
import DeviceDetailsPanel from './content/DeviceDetailsPanel';
import DeviceUsersPanel from './content/DeviceUsersPanel';
import DeviceSessionPanel from './content/DeviceSessionPanel';
import DeviceTabPanel from './content/DeviceTabPanel';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon'

export default function DevicePage({ deviceId }: { deviceId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const showToast = useToast();
  const [deviceSession, setDeviceSession] = useState<DeviceSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getDeviceSession(deviceId);
      setDeviceSession(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load device:', err);
        setError('Failed to load device. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [deviceId, setBusy, handleSessionError]);

  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices', href: '/admin/devices' },
    { 
      label: deviceSession ? (deviceSession.device.deviceId || `Device ${deviceId}`) : ``
    },
  ], [deviceSession, deviceId]);

  if (loading) {
    return null;
  }

  if (!deviceSession) {
    return (
      <AdminItemLayout
        error={'Device Not Found'}
        onRetry={loadDevice}
        breadcrumbs={breadcrumbs}
        icon={<DeviceIcon size={6}/>}
        title={'Unkown Device'}
      />
    );
  }

  const sendNotification = async () => {
    setBusy(true);
    try {
      const results = await apiClientAdmin.sendNotification(
        deviceId,
        'Message from Mystyc Admin',
        'You are beautiful'
      );
      setBusy(false);

      if (results.success) {
        showToast('Notification sent', 'success');
      } else {
        console.error("Error sending Notification", results);
        showToast('Error sending Notification', 'error');
      }
    } catch(err) {
      console.error("Error sending Notification", err);
      showToast('Error sending Notification', 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadDevice}
      breadcrumbs={breadcrumbs}
      button={
        <Button
          onClick={sendNotification}
          className='flex justify-center items-center -mt-4 py-[0.8rem] min-w-20 sm:min-w-44 w-auto'
          disabled={deviceSession.device.fcmToken == null}
        >
          <NotificationIcon size={4} className='text-white'/>
          <span className='hidden sm:inline-block ml-2'>Send Notification</span>
        </Button>
      }
      icon={deviceSession && <DeviceIcon size={6} device={deviceSession.device}/>}
      title={deviceSession && deviceSession.device.deviceName ? deviceSession.device.deviceName : `Unknown Device`}
      headerContent={<DeviceDetailsPanel device={deviceSession && deviceSession.device} />}
      sectionsContent={[
        <Card key='users' className='h-[15rem]'>
          <DeviceUsersPanel deviceId={deviceSession.device.deviceId} />
        </Card>
      ]}
      sidebarContent={<DeviceSessionPanel deviceSession={deviceSession} />}
      mainContent={<DeviceTabPanel deviceId={deviceSession.device.deviceId} />}
    />
  );
}