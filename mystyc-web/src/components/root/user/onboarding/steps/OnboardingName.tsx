'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/util/logger';

import OnboardingBody from '../OnboardingBody';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/form/TextInput';
import FormError from '@/components/form/FormError';

interface OnboardingNameProps {
  onNext: () => void;
  onBack: () => void;
}

export default function OnboardingName({ onNext }: OnboardingNameProps) {
  const { updateOnboardingProfile, user } = useAuth();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { handleApiError } = useErrorHandler({
    component: 'OnboardingName',
    showToast: false,
    onError: (processedError) => {
      setError(processedError.message);
    }
  });

  useEffect(() => {
    if (user?.userProfile?.fullName) {
      setName(user.userProfile.fullName);
    }
  }, [user]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    
    try {
      await updateOnboardingProfile({ fullName: name });
      onNext();
    } catch (e) {
      logger.error('Error updating profile:', e);
      handleApiError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingBody
      title="What's your full name?"
      subtitle="Please enter your full name to personalize your experience."
    >
      <TextInput
        name="fullName"
        autoComplete="name"
        aria-label="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        disabled={loading}
      />

      {error && <FormError message={error} />}

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
          Next
        </Button>
      </div>
    </OnboardingBody>
  );
}