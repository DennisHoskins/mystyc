'use client';

// import { useState } from 'react';
// // import { useAuth } from '@/hooks/useAuth';
// import { useTransitionRouter } from '@/hooks/useTransitionRouter';
// import { useErrorHandler } from '@/hooks/useErrorHandler';
// import { logger } from '@/util/logger';

// import OnboardingBody from '../OnboardingBody';
// import Button from '@/components/ui/Button';
// import FormError from '@/components/form/FormError';

export default function OnboardingComplete() {
  // const router = useTransitionRouter();
  // // const { updateOnboardingProfile } = useAuth();
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const { handleApiError } = useErrorHandler({
  //   component: 'OnboardingComplete',
  //   showToast: false, // We show errors inline for forms
  //   onError: (processedError) => {
  //     setError(processedError.message);
  //   }
  // });

  // const handleFinish = async () => {
  //   setError(null); // Clear previous errors
  //   setLoading(true);
    
  //   try {
  //     // await updateOnboardingProfile({ zodiacSign: 'Pisces' });
  //     router.push('/');
  //   } catch (err) {
  //     logger.error('Error updating zodiac sign:', err);
      
  //     handleApiError(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // return (
  //   <OnboardingBody
  //     title="All Set!"
  //     subtitle="Thank you for completing your profile!"
  //   >
  //     {error && <FormError message={error} />}
  //     <Button onClick={handleFinish} className="w-full" loading={loading}>
  //       Go to Dashboard
  //     </Button>
  //   </OnboardingBody>
  // );
  return <></>
}