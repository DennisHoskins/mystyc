'use client'

import { useState, useEffect, useRef } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { User } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces/';
import { getUserAstrologyData } from '@/server/actions/user';
import { getInsights } from '@/server/actions/insights';
import { useDataStore } from '@/store/dataStore';

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
  const [currentPhase, setCurrentPhase] = useState<'profile' | 'insights'>('profile');
  const hasRun = useRef(false);
  
  // Cache hooks
  const { cacheAstrology, cacheInsights } = useDataStore();

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;    

    const getAstrologicalDataAndInsights = async () => {
      try {
        setIsWorking(true);
        
        // Build astrology profile
        const updatedUser = await getUserAstrologyData(deviceInfo, user);
        
        if (updatedUser) {
          // Cache the astrology data
          cacheAstrology(updatedUser.astrology);
          
          // Generate insights
          setCurrentPhase('insights');
          
          const today = new Date();
          const insights = await getInsights({ deviceInfo, date: today });
          
          if (insights) {
            // Cache today's insights
            cacheInsights(today, deviceInfo.timezone, insights);
          }
          
          onUserReady(updatedUser.user);
          window.dispatchEvent(new CustomEvent('wizard-next'));
        }
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Failed to update profile');
      } finally {
        setIsWorking(false);
      }
    };

    getAstrologicalDataAndInsights();
  }, [deviceInfo, user, setIsWorking, onUserReady, cacheAstrology, cacheInsights]);

  if (!user) {
    return null;
  }

  const headingText = currentPhase === 'profile' ? 'Building your star chart' : 'Generating insights';
  const subtitleText = currentPhase === 'profile' ? 'Please wait...' : 'Almost ready...';

  return (
    <>
      <Heading level={3} className='mb-16'>{headingText}</Heading>
      <FormLayout
        subtitle={subtitleText}
        error={serverError}
      >
        <></>
      </FormLayout>
    </>
  );
}