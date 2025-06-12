'use client';

import { useEffect } from 'react';

import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useApp } from '@/components/context/AppContext';

import FormLayout from '@/components/layout/FormLayout';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function ServerLogoutPage() {
  const router = useCustomRouter();
  const { app } = useApp();

  useEffect(() => {
    if (app && app.user) router.replace('/');
  }, [app, router]);

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <>
      <FormLayout
        subtitle="You have been logged out"
      >
        <Text>
          Your session was ended by an administrator. This may have been done to resolve account issues or for security reasons.
        </Text>
        <div className="space-y-4">
          <Button 
            onClick={handleLoginClick}
            className="w-full"
          >
            Sign In Again
          </Button>
        </div>
      </FormLayout>
    </>
  );
}