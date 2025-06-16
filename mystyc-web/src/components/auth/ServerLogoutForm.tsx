'use client';

import { useState, useEffect } from 'react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useAppStore } from '@/store/appStore';

import FormLayout from '@/components/form/FormLayout';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function ServerLogoutForm() {
  const router = useTransitionRouter();
  const { isLoggedOutByServer, setLoggedOutByServer } = useAppStore();

  const [isReady, setIsReady] = useState(false);

  // mount guard
  useEffect(() => {
    if (isReady) {
      return;
    }
    setIsReady(true);
  }, [isReady, isLoggedOutByServer]);

  useEffect(() => {
    if (isLoggedOutByServer) {
      return;
    }
    router.replace('/');
  }, [isLoggedOutByServer, router]);

  const handleHomeClick = () => {
    setLoggedOutByServer(false);
  };

  // Prevent any render until after mount, and bail if not logged in
  if (!isReady || !isLoggedOutByServer) {
    return null;
  }

  return (
    <FormLayout subtitle="You have been logged out">
      <Text>
        Your session was ended by an administrator. This may have been done to resolve
        account issues or for security reasons.
      </Text>
      <div className="space-y-4">
        <Button onClick={handleHomeClick} className="w-full">
          Home
        </Button>
      </div>
    </FormLayout>
  );
}
