'use client'

import { useState, useEffect, useRef } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { User } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces/';
import { getUserAstrologyData } from '@/server/actions/user';

import Heading from '@/components/ui/Heading';
import FormLayout from '@/components/ui/form/FormLayout';

interface GenerateProfileProps {
  user: AppUser;
  deviceInfo: DeviceInfo;
  setIsWorking: (working: boolean) => void;
  onUserReady: (updatedUser: User) => void;
}

export default function GenerateProfilePanel({ user, deviceInfo, setIsWorking, onUserReady }: GenerateProfileProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;    

    const getAstrologicalData = async () => {
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      try {
        setIsWorking(true);
        const [updatedUser] = await Promise.all([
          getUserAstrologyData(deviceInfo, user),
          sleep(5000),
        ]);
        if (updatedUser) {
          onUserReady(updatedUser.user);
          window.dispatchEvent(new CustomEvent('wizard-next'));
        }
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Failed to update profile');
      } finally {
        setIsWorking(false);
      }
    };

    getAstrologicalData();
  }, [deviceInfo, user, setIsWorking, onUserReady]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Heading level={3} className='mb-16'>Building your star chart</Heading>
      <FormLayout
        subtitle='Please wait...'
        error={serverError}
      >
        <></>
      </FormLayout>
    </>
  );
}