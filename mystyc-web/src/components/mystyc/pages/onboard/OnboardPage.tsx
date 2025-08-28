'use client'

import { useState, useEffect } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import Card from '@/components/ui/Card';
import WorkingEye from '@/components/ui/working/WorkingEye';
import Heading from '@/components/ui/Heading';
import FormWizardLayout from '@/components/ui/form/FormWizardLayout';
import NamePanel from '@/components/mystyc/pages/onboard/panels/NamePanel';
import BirthPanel from '@/components/mystyc/pages/onboard/panels/BirthPanel';
import CityPanel from '@/components/mystyc/pages/onboard/panels/CityPanel';
import ZodiacPanel from '@/components/mystyc/pages/onboard/panels/ZodiacPanel';
import WelcomePanel from '@/components/mystyc/pages/onboard/panels/WelcomePanel';

export default function OnboardingPage({ user } : { user: AppUser }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isWorking, setIsWorking] = useState(false);

  const deviceInfo = getDeviceInfo();

  const steps = [
    { component: WelcomePanel, props: { user }, title: 'Welcome to mystyc!' },
    { component: NamePanel, props: { user, deviceInfo, setIsWorking }, title: 'What is your name?' },
    { component: BirthPanel, props: { user, deviceInfo, setIsWorking }, title: 'When were you born?' },
    { component: CityPanel, props: { user, deviceInfo, setIsWorking }, title: 'Where were you born?' },
    { component: ZodiacPanel, props: { user, deviceInfo, setIsWorking } }
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
    <div className="flex flex-1 flex-col items-center justify-center w-full h-[var(--client-height)] bg-red-400 p-4">
      <Card className='w-full md:max-w-lg text-center space-y-4 p-6 pt-10'>
        <div className='flex flex-col h-[36em]'>
          <WorkingEye scale={1.75} className='pt-10 pb-10' isWorking={isWorking} />
          <div className={`flex flex-col ${isWorking && 'opacity-50'}`}>
            {steps[currentStep]?.title && <Heading level={3} className='mb-8'>{steps[currentStep].title}</Heading>}        
            <FormWizardLayout 
              steps={steps}
              currentStep={currentStep}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}