'use client'

import { useState, useEffect } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import Card from '@/components/ui/Card';
import WorkingEye from '@/components/ui/working/WorkingEye';
import FormWizardLayout from '@/components/ui/form/FormWizardLayout';
import NamePanel from '@/components/mystyc/pages/onboard/panels/NamePanel';
import BirthPanel from '@/components/mystyc/pages/onboard/panels/BirthPanel';
import CityPanel from '@/components/mystyc/pages/onboard/panels/CityPanel';
import SuccessPanel from '@/components/mystyc/pages/onboard/panels/SuccessPanel';
import WelcomePanel from '@/components/mystyc/pages/onboard/panels/WelcomePanel';

export default function OnboardingPage({ user } : { user: AppUser }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isWorking, setIsWorking] = useState(false);

  const deviceInfo = getDeviceInfo();

  // For now, always show welcome (virgin visit)
  const steps = [
    { component: WelcomePanel, props: { user } },
    { component: NamePanel, props: { user, deviceInfo, setIsWorking } },
    { component: BirthPanel, props: { user, deviceInfo, setIsWorking } },
    { component: CityPanel, props: { user, deviceInfo, setIsWorking } },
    { component: SuccessPanel, props: { user, deviceInfo, setIsWorking } }
  ];

  useEffect(() => {
    const handleWizardNext = () => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };
    window.addEventListener('wizard-next', handleWizardNext);
    return () => {
      window.removeEventListener('wizard-next', handleWizardNext);
    };
  }, [steps.length]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center -mt-20 w-full p-4">
      <Card className='w-full md:max-w-lg text-center space-y-4 p-6 pt-10'>
        <WorkingEye scale={1.75} className='mt-6 mb-6' isWorking={isWorking} />
        <FormWizardLayout 
          steps={steps}
          currentStep={currentStep}
          className={`min-h-[400px] ${isWorking ? "opacity-50" : ''}`}
        />
      </Card>
    </div>
  );
}