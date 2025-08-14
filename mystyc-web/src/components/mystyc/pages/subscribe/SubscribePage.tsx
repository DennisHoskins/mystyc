'use client'

import { useState } from "react";
// import { useState, useEffect } from "react";

import { startSubscription } from '@/server/actions/user';
import { getDeviceInfo } from "@/util/getDeviceInfo";

//import { useUser, useInitialized } from "@/components/ui/layout/context/AppContext";
import { useBusy } from "@/components/ui/context/AppContext";  
//import { useTransitionRouter } from "@/hooks/useTransitionRouter";
import { logger } from "@/util/logger";

import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/form/FormError";

export default function SubscribePage({ error } : { error?: string }) {
  // const router = useTransitionRouter();
  // const user = useUser();
  // const initialized = useInitialized();
  const { setBusy } = useBusy();
  const [upgradeError, setUpgradeError] = useState<string | null>(error || null);

  const MYSTYC_PLUS_PRICE_ID = 'price_1Rlx7OFbaKdrXM9uzrIJCnPq';

  const upgradeToPlus = async () => {
    try {
      setUpgradeError("");
      setBusy(true);
      
      const response = await startSubscription(getDeviceInfo(), MYSTYC_PLUS_PRICE_ID);
      if (response && response.sessionUrl) {
        window.location.href = response.sessionUrl;
      } else {
        setUpgradeError('Failed to subscribe. Please try again.');
        setBusy(false);
      }
    } catch(err) {
      logger.log(err);
      setUpgradeError('Failed to subscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // useEffect(() => {
  //   if (!initialized) {
  //     return;
  //   }

  //   if (!user) {
  //     router.replace("/", false);
  //     return;
  //   }
  //   if (user.isPlus) {
  //     router.replace("/account", false);
  //   }
  // }, [initialized, user, router]);  

  // if (!initialized || !user || user.isPlus) {
  //   return null;
  // } 

  return (
    <div className="flex flex-1 justify-center items-center w-full">
      <Card className='w-full md:max-w-lg text-center m-4 items-center space-y-6'>
        <div className="text-center items-center space-y-6 flex flex-col">
          <Heading level={2}>Get Mystyc Plus</Heading>
          <Text className="max-w-xl text-center">
            Get access to mystical insights that dive deeper into your zodiac traits, birth chart influences, and personal cosmic timeline - beyond daily guidance to truly personalized mystical coaching.
          </Text>

          <ul>
            <li>Reason 1</li>
            <li>Reason 2</li>
            <li>Reason 3</li>
            <li>Reason 4</li>
            <li>Reason 5</li>
          </ul>

          {upgradeError && <FormError message={upgradeError} />}

          <Button 
            onClick={upgradeToPlus}
            className="w-full max-w-md"
          >
            Upgrade
          </Button>
        </div>
      </Card>
    </div>
  );
}