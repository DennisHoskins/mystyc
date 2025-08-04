'use client'

import { useState, useEffect } from 'react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { AppUser } from '@/interfaces/app/app-user.interface';
import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import Button from '@/components/ui/Button';

export default function SuccessPanel({ user, setIsWorking } : { user: AppUser, setIsWorking: (working: boolean) => void }) {
  const router = useTransitionRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsWorking(true);
    
    setTimeout(() => {
      setIsWorking(false);
      setIsReady(true);
    }, 2000)
  }, [setIsWorking, setIsReady])
  
  if (!user) {
    return null;
  }

  const handleSubmit = () => {
    // go to /
    router.replace("/");
  }

  if (!isReady) {
    return;
  }

  return (
    <FormLayout
      title="The stars have spoken!"
      subtitle={
        <>
          
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Button
          type="submit"
          // loading={isWorking}
          loadingContent="Working..."
          className="mt-6 py-3 w-40 self-center !rounded-full"
        >
          OK
        </Button>
      </Form>
    </FormLayout>
  );
}