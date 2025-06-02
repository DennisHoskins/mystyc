'use client';

import { useEffect, useState, useRef } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import { useUserCache } from '@/hooks/useUserCache';
import { apiClient } from '@/api/apiClient';
import { AuthEvent } from '@/interfaces/authEvent.interface';
import { Device } from '@/interfaces/device.interface';
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
  const { deviceData } = useAuth();
  const { clearCachedUser } = useUserCache();
  const [countdown, setCountdown] = useState(5);
  const hasRedirected = useRef(false);
  const hasTrackedLogout = useRef(false);
  const deviceDataRef = useRef<Device | null>(null);
  const idTokenRef = useRef<string | null>(null);
  const firebaseUserRef = useRef(firebaseUser);

  // Capture auth data before it gets cleared
  useEffect(() => {
    if (deviceData) {
      deviceDataRef.current = deviceData;
    }
  }, [deviceData]);

  useEffect(() => {
    if (idToken) {
      idTokenRef.current = idToken;
    }
  }, [idToken]);

  useEffect(() => {
    if (firebaseUser) {
      firebaseUserRef.current = firebaseUser;
    }
  }, [firebaseUser]);

  // Track logout event before signing out
  useEffect(() => {
    const trackLogoutEvent = async () => {
      if (hasTrackedLogout.current) return;
      hasTrackedLogout.current = true;

      console.log('[LogoutPage Debug]', {
        hasIdToken: !!idTokenRef.current,
        hasDeviceData: !!deviceDataRef.current,
        hasFirebaseUser: !!firebaseUserRef.current,
        hasTrackedLogout: hasTrackedLogout.current,
      });

      // Only track if we have auth token and device data
      if (!idTokenRef.current) {
        logger.log('[LogoutPage] No auth token, skipping logout tracking');
        signOut(true);
        return;
      }

      if (!deviceDataRef.current) {
        logger.log('[LogoutPage] No device data, skipping logout tracking');
        signOut(true);
        return;
      }

      try {
        logger.log('[LogoutPage] Tracking logout event');
        
        // Generate logout auth event
        const authEvent: AuthEvent = {
          firebaseUid: firebaseUserRef.current?.uid || 'unknown',
          deviceId: deviceDataRef.current.deviceId,
          ip: '192.0.0.0',
          platform: deviceDataRef.current.platform,
          clientTimestamp: new Date().toISOString(),
          type: 'logout'
        };

        // Send logout event to server with real device data
        await apiClient.logout(idTokenRef.current, deviceDataRef.current, authEvent);
        
        logger.log('[LogoutPage] Logout event tracked successfully');
      } catch (err) {
        // Handle logout tracking errors gracefully
        errorHandler.processError(err, {
          component: 'LogoutPage',
          action: 'trackLogoutEvent',
          additional: { deviceId: deviceDataRef.current?.deviceId }
        });
        
        logger.warn('[LogoutPage] Failed to track logout event, continuing with signout');
      } finally {
        // Always sign out, regardless of tracking success/failure
        clearCachedUser();
        signOut(true);
      }
    };

    trackLogoutEvent();
  }, [signOut, clearCachedUser]);

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