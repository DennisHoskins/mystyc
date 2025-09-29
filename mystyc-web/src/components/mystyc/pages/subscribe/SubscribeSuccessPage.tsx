'use client'

import { useEffect, useState, useRef } from 'react';

import { getUser } from '@/server/actions/user';
import { getDeviceInfo } from "@/util/getDeviceInfo";

import { useUser, useSetUser, useBusy, useToast } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { logger } from '@/util/logger';

import Card from "@/components/ui/Card";
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import FormError from '@/components/ui/form/FormError';

export default function SubscribeSuccessPage() {
  const showToast = useToast();
  const router = useTransitionRouter();
  const setUser = useSetUser();
  const { setBusy } = useBusy();
  const user = useUser();
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [error, setError] = useState("");

  const hasRunRef = useRef(false);

  useEffect(() => {

    debugger

    if (hasRunRef.current) return;
    hasRunRef.current = true;
    
    const updateUserSubscription = async () => {
      if (!user) {
        router.replace("/", false);
        return;
      }

      if (!isSubscribe) {
        if (user.isPlus) {
          router.replace("/account", false);
          return;
        }

        setIsSubscribe(true);
      }

      if (user.isPlus) {
        hasRunRef.current = true;
        setBusy(false);
        return;
      }

      try {
        setBusy(true);
        const updatedUser = await getUser(getDeviceInfo());
        setUser(updatedUser);
        showToast("Upgraded to Mystyc Plus!", "success");
      } catch (error) {
        // error handling
        logger.error(error);
        setError("Failed to update subscription");
      } finally {
        setBusy(false);
      }
    };

    updateUserSubscription();
  }, [user, setUser, isSubscribe, setIsSubscribe, router, setBusy, showToast]);

  const handleClick = () => {
    router.replace("/");
  }    

  return (
    <Card className='w-full md:max-w-lg text-center p-4 m-4'>
      <div className='flex-1 flex flex-col items-center justify-center gap-4'>
        <Heading level={2}>Welcome to Mystyc Plus!</Heading>
        <Text>{user?.isPlus}</Text>
        <Text>{user?.userProfile.subscription.level}</Text>
        <Text>{user?.userProfile.stripeCustomerId}</Text>

        {error && <FormError message={error} />}

        <Button
          onClick={handleClick}
        >
          Awesome!
        </Button>
      </div>
    </Card>
  );
}