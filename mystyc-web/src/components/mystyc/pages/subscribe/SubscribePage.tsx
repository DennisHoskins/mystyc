'use client';

import { useState, useEffect } from "react";

import { apiClient } from "@/api/apiClient";
import { useUser, useInitialized } from "@/components/ui/layout/context/AppContext";
import { useBusy } from "@/components/ui/layout/context/AppContext";  
import { useTransitionRouter } from "@/hooks/useTransitionRouter";
import { logger } from "@/util/logger";

import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/form/FormError";

export default function SubscribePage({ error } : { error?: string }) {
  const router = useTransitionRouter();
  const user = useUser();
  const initialized = useInitialized();
  const { setBusy } = useBusy();
  const [upgradeError, setUpgradeError] = useState<string | null>(error || null);

  const MYSTYC_PLUS_PRICE_ID = 'price_1Rlx7OFbaKdrXM9uzrIJCnPq';

  const upgradeToPlus = async () => {
    try {
      setUpgradeError("");
      setBusy(true);
      const response = await apiClient.user.startSubscription(MYSTYC_PLUS_PRICE_ID);
      window.location.href = response.sessionUrl;
    } catch(err) {
      logger.log(err);
      setUpgradeError('Failed to subscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user) {
      router.replace("/", false);
      return;
    }
    if (user.isPlus) {
      router.replace("/account", false);
    }
  }, [initialized, user, router]);  

  if (!initialized || !user || user.isPlus) {
    return null;
  } 

  return (
    <Card className='w-full md:max-w-lg text-center p-4 m-4'>
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
  );
}