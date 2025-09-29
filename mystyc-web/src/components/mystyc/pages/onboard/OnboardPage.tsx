'use client'

import { useState, useEffect } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { User } from 'mystyc-common';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import Card from '@/components/ui/Card';
import WorkingEye from '@/components/ui/working/WorkingEye';
import Heading from '@/components/ui/Heading';
import FormWizardLayout from '@/components/ui/form/FormWizardLayout';
import NamePanel from '@/components/mystyc/pages/onboard/panels/NamePanel';
import BirthPanel from '@/components/mystyc/pages/onboard/panels/BirthPanel';
import CityPanel from '@/components/mystyc/pages/onboard/panels/CityPanel';
import GenerateProfilePanel from '@/components/mystyc/pages/onboard/panels/GenerateProfilePanel';
import WelcomePanel from '@/components/mystyc/pages/onboard/panels/WelcomePanel';
import TourPanel from '@/components/mystyc/pages/onboard/panels/TourPanel';

function TourPanelWithFade({ user, updatedUser }: { user: AppUser, updatedUser: User | null }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300); // Wait for card resize
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div 
      className="transition-opacity duration-500 ease-in-out"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <TourPanel user={user} updatedUser={updatedUser} />
    </div>
  );
}

export default function OnboardingPage({ user } : { user: AppUser }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);

  const deviceInfo = getDeviceInfo();

  const handleUserReady = (user: User) => {
    setUpdatedUser(user);
  };

  const steps = [
    { component: WelcomePanel, props: { user }, title: 'Welcome to mystyc!' },
    { component: NamePanel, props: { user, deviceInfo, setIsWorking }, title: 'What is your name?' },
    { component: BirthPanel, props: { user, deviceInfo, setIsWorking }, title: 'When were you born?' },
    { component: CityPanel, props: { user, deviceInfo, setIsWorking }, title: 'Where were you born?' },
    { component: GenerateProfilePanel, props: { user, deviceInfo, setIsWorking, onUserReady: handleUserReady } },
    { component: TourPanel, props: { user, updatedUser }, title: `Welcome to mystyc, ${updatedUser?.userProfile.astrology?.sun.sign}!` },
  ];

  useEffect(() => {
    const handleWizardNext = () => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      window.dispatchEvent(new CustomEvent('scroll-reset'));
    };
    window.addEventListener('wizard-next', handleWizardNext);
    return () => {
      window.removeEventListener('wizard-next', handleWizardNext);
    };
  }, [steps.length]);

  if (!user) {
    return null;
  }

  const isOnTourStep = currentStep === 5;

  return (
    <div className="w-full h-full flex justify-center items-center">

      <Card className={`w-full -mt-[59px] ${isOnTourStep ? 'md:max-w-2xl h-auto md:!mt-6' : 'md:max-w-lg'} text-center space-y-4 transition-all duration-300 ease-in-out`}>
        <div className={`flex flex-col ${isOnTourStep ? 'h-full' : 'min-h-[36em] h-auto'}`}>
          <WorkingEye scale={isOnTourStep ? 1 : 1.75} className={`${isOnTourStep ? 'pt-0 md:pt-4 pb-0 md:pb-4' : 'pt-10 pb-10'}`} isWorking={isWorking} />
          <div className={`flex flex-col ${isWorking && 'opacity-50'}`}>
            {steps[currentStep]?.title && <Heading level={3} className='mb-8'>{steps[currentStep].title}</Heading>}        
            {isOnTourStep ? (
              <TourPanelWithFade user={user} updatedUser={updatedUser} />
            ) : (
              <FormWizardLayout 
                steps={steps}
                currentStep={currentStep}
              />
            )}
          </div>
        </div>
      </Card>

    </div>
  );
}