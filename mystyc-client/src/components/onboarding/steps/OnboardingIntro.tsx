'use client';

import React from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useSessionStorage } from '@/hooks/useSessionStorage';

import OnboardingHeader from '../OnboardingHeader';
import Button from '@/components/ui/Button';

export default function OnboardingIntro({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const { setValue: setIntroShown } = useSessionStorage('onboardingIntroShown');

  const handleContinue = () => {
    if (user?.userProfile?.id) {
      setIntroShown(user.userProfile.id);
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <OnboardingHeader
        title="Welcome Knowledge Seeker"
        subtitle="We need a few details to help tailor your experience."
      />

      <Button onClick={handleContinue} className="w-full">
        Get Started
      </Button>
    </div>
  );
}