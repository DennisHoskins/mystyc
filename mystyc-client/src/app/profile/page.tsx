'use client';

import { useEffect, useState, useCallback } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { withAuth } from '@/auth/withAuth';
import { useBusy } from '@/components/context/BusyContext';
import { useToast } from '@/hooks/useToast';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { formatDateForInput } from '@/util/dateTime';

import PageContainer from '@/components/layout/PageContainer';
import TextInput from '@/components/form/TextInput';
import Button from '@/components/ui/Button';
import FormError from '@/components/form/FormError';

function EditProfilePage() {
  const router = useCustomRouter();
  const { user, updateOnboardingProfile } = useAuth();
  const { setBusy } = useBusy();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.userProfile) {
      setFullName(user.userProfile.fullName || '');
      setZodiacSign(user.userProfile.zodiacSign || '');
      setDateOfBirth(formatDateForInput(user.userProfile.dateOfBirth));
    }
  }, [user]);

  const handleSave = useCallback(async () => {
    setError(null);
    setLoading(true);
    setBusy(true, 0);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));
    const update = updateOnboardingProfile({ fullName, dateOfBirth, zodiacSign });

    try {
      await Promise.all([minDelay, update]);
      showToast('Profile updated');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setBusy(false);
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [fullName, dateOfBirth, zodiacSign, updateOnboardingProfile, setBusy, showToast]);

  const handleCancel = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <PageContainer>
      <h2 className="mt-8 text-xl font-semibold text-center">Edit Your Profile</h2>

      <div className="mt-6 max-w-md mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <TextInput
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <TextInput
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zodiac Sign</label>
          <button
            type="button"
            className="w-full py-2 px-3 border border-gray-300 rounded-md text-left"
            onClick={() => alert('Zodiac chooser coming soon')}
            disabled={loading}
          >
            {zodiacSign || 'Select zodiac sign'}
          </button>
        </div>

        {error && <FormError message={error} />}

        <div className="space-y-2">
          <Button 
            onClick={handleSave} 
            className="w-full" 
            loading={loading} 
            loadingContent="Saving..."
          >
            Save Changes
          </Button>

          <Button
            variant="secondary"
            onClick={handleCancel}
            className="w-full"
            disabled={loading}
          >
            Home
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

export default withAuth(EditProfilePage, { requireOnboarding: true });