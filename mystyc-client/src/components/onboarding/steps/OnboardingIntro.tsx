'use client';

import React from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { storage } from '@/util/storage';

import OnboardingHeader from '../OnboardingHeader';
import Button from '@/components/ui/Button';

export default function OnboardingIntro({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();

  const handleContinue = () => {
    if (user?.userProfile?.id) {
      storage.session.setItem('onboardingIntroShown', user.userProfile.id);
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