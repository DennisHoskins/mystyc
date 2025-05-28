'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useBusy } from '@/components/context/BusyContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useSessionStorage } from '@/hooks/useSessionStorage';
import { logger } from '@/util/logger';

import OnboardingIntro from './steps/OnboardingIntro';
import OnboardingName from './steps/OnboardingName';
import OnboardingBirth from './steps/OnboardingBirth';
import OnboardingComplete from './steps/OnboardingComplete';

const stepDefinitions = [
  { key: 'intro', component: OnboardingIntro },
  { key: 'name', component: OnboardingName },
  { key: 'birth', component: OnboardingBirth },
  { key: 'complete', component: OnboardingComplete },
] as const;

type StepKey = typeof stepDefinitions[number]['key'];

export default function OnboardingLayout() {
  const { setBusy } = useBusy();
  const router = useCustomRouter();
  const { loading, user } = useAuth();
  const { value: introShown, isLoading: sessionLoading } = useSessionStorage('onboardingIntroShown');

  const [stepKey, setStepKey] = useState<StepKey>('intro');
  const [localLoading, setLocalLoading] = useState(true);

  const handleNext = useCallback(() => {
    const currentIndex = stepDefinitions.findIndex((s) => s.key === stepKey);
    const next = stepDefinitions[currentIndex + 1];
    if (next) {
      setStepKey(next.key);
    } else {
      router.replace('/');
    }
  }, [stepKey, router]);

  const handleBack = useCallback(() => {
    const currentIndex = stepDefinitions.findIndex((s) => s.key === stepKey);
    const prev = stepDefinitions[currentIndex - 1];
    if (prev) {
      setStepKey(prev.key);
    }
  }, [stepKey]);

  useEffect(() => {
    if (loading || !user || stepKey !== 'intro' || sessionLoading) return;

    const hasSeenIntro = introShown === user.userProfile.id;

    if (!user.userProfile.fullName) {
      const nextStep = hasSeenIntro ? 'name' : 'intro';
      logger.log('[OnboardingLayout] Setting step to:', nextStep);
      setStepKey(nextStep);
    } else if (!user.userProfile.dateOfBirth) {
      logger.log('[OnboardingLayout] Setting step to: birth');
      setStepKey('birth');
    } else {
      logger.log('[OnboardingLayout] Setting step to: complete');
      setStepKey('complete');
    }
  }, [user, sessionLoading, introShown]);

  useEffect(() => {
    if (loading || !user || sessionLoading) {
      setBusy(true);
      setLocalLoading(true);
    } else {
      setLocalLoading(false);
      setBusy(false);
    }
  }, [loading, user, sessionLoading]);

  if (loading || localLoading || sessionLoading) return null;

  const current = stepDefinitions.find((s) => s.key === stepKey);
  if (!current) return null;

  const StepComponent = current.component;

  return (
    <div className="max-w-md mx-auto mt-10 px-4">
      <StepComponent onNext={handleNext} onBack={handleBack} />
    </div>
  );
}