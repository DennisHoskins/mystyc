'use client';

import { useEffect, useState, useRef } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { apiClient } from '@/api/apiClient';
import { AuthEventData } from '@/interfaces/authEventData.interface';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

import PageContainerAuth from '@/components/layout/PageContainerAuth';
import FormLayout from '@/components/layout/FormLayout';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function LogoutPage() {
  const { signOut, idToken, firebaseUser } = useAuth();
  const router = useCustomRouter();
  const { deviceData } = useDeviceInfo();
  const [countdown, setCountdown] = useState(5);
  const hasRedirected = useRef(false);
  const hasTrackedLogout = useRef(false);

  // Track logout event before signing out
  useEffect(() => {
    const trackLogoutEvent = async () => {
      if (hasTrackedLogout.current) return;
      hasTrackedLogout.current = true;

      // Only track if we have auth token and device data
      if (!idToken) {
        logger.log('[LogoutPage] No auth token, skipping logout tracking');
        signOut(true);
        return;
      }

      if (!deviceData) {
        logger.log('[LogoutPage] No device data, skipping logout tracking');
        signOut(true);
        return;
      }

      try {
        logger.log('[LogoutPage] Tracking logout event');
        
        // Generate logout auth event
        const authEventData: AuthEventData = {
          firebaseUid: firebaseUser?.uid || 'unknown',
          deviceId: deviceData.deviceId,
          ip: '192.0.0.0',
          platform: deviceData.platform,
          clientTimestamp: new Date().toISOString(),
          type: 'logout'
        };

        // Send logout event to server with real device data
        await apiClient.getCurrentUserWithDevice(idToken, deviceData, authEventData);
        
        logger.log('[LogoutPage] Logout event tracked successfully');
      } catch (err) {
        // Handle logout tracking errors gracefully
        errorHandler.processError(err, {
          component: 'LogoutPage',
          action: 'trackLogoutEvent',
          additional: { deviceId: deviceData?.deviceId }
        });
        
        logger.warn('[LogoutPage] Failed to track logout event, continuing with signout');
      } finally {
        // Always sign out, regardless of tracking success/failure
        signOut(true);
      }
    };

    trackLogoutEvent();
  }, [signOut, idToken, deviceData, firebaseUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1 && !hasRedirected.current) {
          hasRedirected.current = true;
          clearInterval(interval);
          setTimeout(() => {
            router.replace('/');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const handleHomeClick = () => {
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      router.replace('/');
    }
  };

  return (
    <PageContainerAuth>
      <FormLayout>
        <div className="text-center space-y-8">
          
          <div className="space-y-4">
            <Heading level={1}>
              You&apos;ve been signed out
            </Heading>
            <Text>
              Thanks for using mystyc! We hope to see you again soon.
            </Text>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleHomeClick}
              className="w-full"
            >
              Home
            </Button>
            
            <Text variant="small">
              Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
            </Text>
          </div>
        </div>
      </FormLayout>
    </PageContainerAuth>
  );
}