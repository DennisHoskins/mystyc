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

export default function AccountPage() {
  const router = useTransitionRouter();
  const user = useUser();
  const initialized = useInitialized();
  const { setBusy } = useBusy();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user) {
      router.replace("/", false);
      return;
    }
  }, [initialized, user, router]);  

  if (!initialized || !user) {
    return null;
  } 

  const subscribeToPlus = () => {
    router.push("/subscribe");
  }

  const cancelSubscription = async () => {
    try {
      setError("");
      setBusy(true);
//      const response = await apiClient.startSubscription(MYSTYC_PLUS_PRICE_ID);
//      window.location.href = response.sessionUrl;
    } catch(err) {
      logger.log(err);
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className='w-full md:max-w-lg text-center p-4 m-4'>
        <div className="text-center items-center space-y-6 flex flex-col">
          <Heading level={2}>Account</Heading>

          {error && <FormError message={error} />}

          {user.isPlus ? (
            <Button 
              onClick={cancelSubscription}
              className="w-full max-w-md"
            >
              Cancel Subscription
            </Button>
          ) : (
            <Button 
              onClick={subscribeToPlus}
              className="w-full max-w-md"
            >
              Upgrade to Mystyc Plus
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}