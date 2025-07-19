'use client';

import { useState, useEffect } from "react";

import { apiClient } from "@/api/apiClient";
import { useUser, useSetUser, useInitialized, useBusy, useToast } from "@/components/ui/layout/context/AppContext";
import { useTransitionRouter } from "@/hooks/useTransitionRouter";
import { logger } from "@/util/logger";

import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
//import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/form/FormError";

const MYSTYC_PLUS_PRICE_ID = 'price_1Rlx7OFbaKdrXM9uzrIJCnPq';

export default function AccountPage() {
  const router = useTransitionRouter();
  const user = useUser();
  const setUser = useSetUser();
  const initialized = useInitialized();
  const { setBusy } = useBusy();
  const showToast = useToast();
  const [loaded, setLoaded] = useState(false);
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!user) {
      router.replace("/", false);
      return;
    }

    if (loaded) {
      return;
    }
    setLoaded(true);

    const loadBillingPortal = async () => {
      try {
        setBusy(true);
        const response = await apiClient.getCustomerBillingPortal();
        if (response) {
          setUrl(response.portalUrl);
        } else {
          logger.log("No billing portal URL returned");
        }
      } catch (err) {
        logger.error("Failed to load billing portal:", err);
        setError('Failed to load billing portal. Please try again.');
      } finally {
        setBusy(false);
      }
    }

    loadBillingPortal();
  }, [initialized, user, router, setUrl, setBusy, setError, loaded, setLoaded]);  

  if (!initialized || !user || !loaded) {
    return null;
  } 

  const upgradeToPlus = async () => {
    try {
      setError("");
      setBusy(true);
      const response = await apiClient.startSubscription(MYSTYC_PLUS_PRICE_ID);
      window.location.href = response.sessionUrl;
    } catch(err) {
      logger.log(err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const showBillingPortal = () => {
    if (!url) {
      return;
    }
    window.open(url, "_blank");    
  }

  const cancelSubscription = async () => {
    try {
      setError("");
      setBusy(true);
      const response = await apiClient.cancelSubscription();
      if (response.success) {
        logger.log("Subscription cancelled successfully");

        const updatedUser = await apiClient.getUser();
        setUser(updatedUser);

        showToast("Subscription cancelled successfully", "success");
      } else {
        setError(response.message || "Failed to cancel subscription. Please try again.");
      }
    } catch(err) {
      logger.log(err);
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className='w-full md:max-w-lg text-center p-4 m-4 items-center space-y-6 flex flex-col'>
        <Heading level={2}>Account</Heading>

        {error && <FormError message={error} />}

        {user.isPlus ? (
            <>
              <Button 
                onClick={showBillingPortal}
                className="w-full max-w-md"
                disabled={!url}
              >
                Go to Stripe Billing Portal
              </Button>
              <Button 
                onClick={cancelSubscription}
                className="w-full max-w-md"
              >
                Cancel Subscription
              </Button>
            </>
          ) : (
            <Button 
              onClick={upgradeToPlus}
              className="w-full max-w-md"
            >
              Upgrade to Mystyc Plus
            </Button>
          )}
      </Card>
    </div>
  );
}