'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/util/logger';

import OnboardingBody from '../OnboardingBody';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/form/TextInput';
import FormError from '@/components/form/FormError';

interface OnboardingBirthProps {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingBirth({ onNext, onBack }: OnboardingBirthProps) {
  const { updateOnboardingProfile, user } = useAuth();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { handleApiError } = useErrorHandler({
    component: 'OnboardingBirth',
    showToast: false,
    onError: (processedError) => {
      setError(processedError.message);
    }
  });

  useEffect(() => {
    if (user?.userProfile?.dateOfBirth) {
      try {
        const date = new Date(user.userProfile.dateOfBirth);
        if (!isNaN(date.getTime())) {
          setDateOfBirth(date.toISOString().slice(0, 10));
        }
      } catch (e) {
        logger.warn('Invalid dateOfBirth in user profile:', user.userProfile.dateOfBirth);
        handleApiError(e, 'onboarding-birth-set');
      }
    }
  }, [user, handleApiError]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await updateOnboardingProfile({ dateOfBirth });
      onNext();
    } catch (e) {
      logger.error('Error updating date of birth:', e);
      handleApiError(e, 'onboarding-birth-update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingBody
      title="When's your birthday?"
      subtitle="We'll use this to provide personalized insights."
    >
      <TextInput
        type="date"
        name="dateOfBirth"
        aria-label="Date of birth"
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
        disabled={loading}
      />

      {error && <FormError message={error} />}

      <div className="flex justify-between">
        <Button 
          variant="secondary" 
          onClick={onBack} 
          disabled={loading}
        >
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !dateOfBirth.trim()}
        >
          Next
        </Button>
      </div>
    </OnboardingBody>
  );
}