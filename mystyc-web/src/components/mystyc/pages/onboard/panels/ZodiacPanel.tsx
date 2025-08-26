'use client'

import { useState, useEffect, useRef } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { User } from 'mystyc-common';
import { DeviceInfo } from '@/interfaces/';
import { getUserAstrologyData } from '@/server/actions/user';
import { useSetUser } from '@/components/ui/context/AppContext'; 

import Heading from '@/components/ui/Heading';
import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import Button from '@/components/ui/Button';

interface SuccessPanelProps {
  user: AppUser;
  deviceInfo: DeviceInfo;
  setIsWorking: (working: boolean) => void;
}

export default function SuccessPanel({ user, deviceInfo, setIsWorking }: SuccessPanelProps) {
  const setUser = useSetUser();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [updatedUser, setUpdatedUser] = useState<User | null>(null);
  const hasRun = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;    

    const getAstrologicalData = async () => {
    
      const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      debugger

      try {
        setIsWorking(true);
        const [updatedUser] = await Promise.all([
          getUserAstrologyData(deviceInfo, user),
          sleep(5000),
        ]);
        if (updatedUser) {
          setUpdatedUser(updatedUser);
          setIsReady(true);
        }
      } catch (error) {
        setServerError(error instanceof Error ? error.message : 'Failed to update profile');
      } finally {
        setIsWorking(false);
      }
    };

    getAstrologicalData();
  }, [deviceInfo, user, setUser, setIsWorking]);

  useEffect(() => {
    if (isReady && buttonRef.current) {
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 100);
    }
  }, [isReady]);  

  if (!user) {
    return null;
  }

  const handleSubmit = () => {
    if (!updatedUser) {
      return;
    }

    window.dispatchEvent(new CustomEvent('wizard-next'));

    setTimeout(() => {
      const newUser = {
        ...user,
        userProfile: updatedUser.userProfile,
      };
      setUser(newUser);
    }, 1000);      
  }

  return (
    <>
      <Heading level={3} className='mb-16'>{isReady ? `Welcome to mystyc, ${updatedUser?.userProfile.astrology?.sunSign}` : "Building your star chart"}</Heading>
      <FormLayout
        subtitle={isReady 
          ? <>
              The stars have spoken!      
              <br />
              We are ready to begin your journey.            
            </> 
          : <>Please wait...</>
        }
        error={serverError}
      >
        <Form onSubmit={handleSubmit} className={`${isReady ? "" : "opacity-0"}`}>
          <Button
            ref={buttonRef}
            type="submit"
            className="mt-4 py-3 w-40 self-center !rounded-full"
          >
            Let&apos;s Go!
          </Button>
        </Form>
      </FormLayout>
    </>
  );
}