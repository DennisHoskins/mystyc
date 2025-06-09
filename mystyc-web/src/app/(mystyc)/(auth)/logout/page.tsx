'use client';

import { useEffect, useState, useRef } from 'react';

import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useAuth } from '@/hooks/useAuth';
import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

import PageContainerAuth from '@/components/layout/PageContainerAuth';
import FormLayout from '@/components/layout/FormLayout';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

import { useBusy } from '@/components/context/BusyContext';

export default function LogoutPage() {
  const router = useCustomRouter();
  const { signOut } = useAuth();
  const { setBusy } = useBusy();
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const hasRedirected = useRef(false);
  const [startCountdown, setStartCountdown] = useState(false);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut();
        setLoading(false);
        setBusy(false);
        setStartCountdown(true);
      } catch(err) {
        errorHandler.processError(err, {
          component: 'LogoutPage',
          action: 'trackLogoutEvent',
        });
        
        logger.warn('[LogoutPage] Failed to track logout event, continuing with signout');
      }
    };

    handleLogout();
  }, [signOut, setBusy]);

  useEffect(() => {
    if (!startCountdown) {
      return;
    }
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
  }, [router, startCountdown]);

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
              loading={loading}
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