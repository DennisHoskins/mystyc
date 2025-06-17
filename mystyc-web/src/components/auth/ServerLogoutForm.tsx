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

  // Initialize component
  useEffect(() => {
    if (isReady) return;
    setIsReady(true);
  }, [isReady]);

  // Redirect if not in server logout state
  useEffect(() => {
    if (!isReady || isLoggedOutByServer) {
      return;
    }
    
    router.replace('/');
  }, [isReady, isLoggedOutByServer, router]);

  const handleHomeClick = () => {
    setLoggedOutByServer(false);
    router.replace('/');
  };

  if (!isReady || !isLoggedOutByServer) {
    return null;
  }

  return (
    <FormLayout subtitle="You have been logged out">
      <Text>
        Your session was ended by an administrator. This may have been done to resolve
        account issues or for security reasons.
      </Text>
      
      <Button onClick={handleHomeClick} className="w-full">
        Home
      </Button>
    </FormLayout>
  );
}