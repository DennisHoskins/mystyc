'use client';

import { useEffect, useState, useRef } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';

import Button from '@/components/ui/Button';
import PageContainer from '@/components/layout/PageContainer';
import FormLayout from '@/components/layout/FormLayout';

export default function LogoutPage() {
  const { signOut } = useAuth();
  const router = useCustomRouter();
  const [countdown, setCountdown] = useState(5);
  const hasRedirected = useRef(false);

  useEffect(() => {
    signOut(true);
  }, [signOut]);

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
    <PageContainer>
      <FormLayout>
        <div className="text-center space-y-8">
          
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-gray-900">
              You&apos;ve been signed out
            </h1>
            <p className="text-gray-600">
              Thanks for using mystyc! We hope to see you again soon.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleHomeClick}
              className="w-full"
            >
              Home
            </Button>
            
            <p className="text-sm text-gray-500">
              Redirecting automatically in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
        </div>
      </FormLayout>
    </PageContainer>
  );
}