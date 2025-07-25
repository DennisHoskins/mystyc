'use client';

// import { useEffect, useState, useCallback } from 'react';
import { useState, useCallback } from 'react';

import { useBusy } from '@/components/ui/layout/context/AppContext';
//import { useToast } from '@/hooks/useToast';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
// import { formatDateForInput } from '@/util/dateTime';
//import { errorHandler } from '@/util/errorHandler';
import { logger } from '@/util/logger';

import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';
import FormLabel from '@/components/ui/form/FormLabel';
import FormError from '@/components/ui/form/FormError';
import Heading from '@/components/ui/Heading';

function EditProfilePage() {
  const router = useTransitionRouter();
//  const { updateOnboardingProfile } = useAuth();
  const { setBusy } = useBusy();
//  const { showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  // const [zodiacSign, setZodiacSign] = useState('');
  const [zodiacSign] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // const user = uid;

  // useEffect(() => {
  //   if (user?.userProfile) {
  //     setFullName(user.userProfile.fullName || '');
  //     setZodiacSign(user.userProfile.zodiacSign || '');
  //     setDateOfBirth(formatDateForInput(user.userProfile.dateOfBirth));
  //   }
  // }, [user]);

  const handleSave = useCallback(async () => {
    setError(null);
    setLoading(true);
    setBusy(true);

//    const minDelay = new Promise((resolve) => setTimeout(resolve, 1500));
//    const update = updateOnboardingProfile({ fullName, dateOfBirth, zodiacSign });

    try {
//      await Promise.all([minDelay, update]);
//      showToast('Profile updated');
    } catch (e) {
      logger.log(e);
      setError('Failed to update profile. Please try again.');
      // errorHandler.processError(e, {
      //   component: 'EditProfilePage',
      //   action: 'profile-update'
      // });      
      setBusy(false);
    } finally {
      setBusy(false);
      setLoading(false);
    }
//  }, [fullName, dateOfBirth, zodiacSign, updateOnboardingProfile, setBusy, showToast]);
  // }, [fullName, dateOfBirth, zodiacSign, setBusy, showToast]);
//  }, [setBusy, showToast]);
  }, [setBusy, ]);

  const handleCancel = useCallback(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="w-full max-w-md">

      <Heading level={2} className="mt-8 text-center">Edit Your Profile</Heading>

      <div className="mt-6 max-w-md mx-auto space-y-6">
        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Full Name</FormLabel>
          <TextInput
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            disabled={loading}
          />
        </div>

        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</FormLabel>
          <TextInput
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-1">Zodiac Sign</FormLabel>
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
    </div>
  );
}

export default EditProfilePage;