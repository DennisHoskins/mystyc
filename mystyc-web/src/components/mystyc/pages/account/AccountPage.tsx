'use client';

import { useState, useEffect } from "react";

import { startSubscription, cancelSubscription, getBillingPortal, getUser } from '@/server/actions/user';
import { getDeviceInfo } from "@/util/getDeviceInfo";

import { handleSessionError } from '@/util/sessionErrorHandler'; 
import { useTransitionRouter } from "@/hooks/useTransitionRouter";
import { logger } from "@/util/logger";

import { useUser, useSetUser, useInitialized, useBusy, useToast } from "@/components/ui/layout/context/AppContext";
import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
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
  const [loading, setLoading] = useState(true);
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
        setError("");

        const response = await getBillingPortal(getDeviceInfo());
        if (response && response.portalUrl) {
          setUrl(response.portalUrl);
        } else {
          logger.log("No billing portal URL returned");
          setError('Failed to load billing portal. Please try again.');
        }
      } catch (err) {
        await handleSessionError(err, 'loadBillingPortal');
        logger.error("Failed to load billing portal:", err);
        setError('Failed to load billing portal. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadBillingPortal();
  }, [initialized, user, router, setUrl, setBusy, setError, loaded, setLoaded]);  

  if (!initialized || !user || !loaded) {
    return null;
  } 

  const handleUpgradeToPlus = async () => {
    try {
      setError("");
      setBusy(true);

      const response = await startSubscription(getDeviceInfo(), MYSTYC_PLUS_PRICE_ID);
      if (response && response.sessionUrl) {
        window.location.href = response.sessionUrl;
      } else {
        setError('Failed to subscribe. Please try again.');
        setBusy(false);
      }
    } catch(err) {
      await handleSessionError(err, 'upgradeToPlus');
      logger.log(err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleShowBillingPortal = () => {
    if (!url) {
      return;
    }
    window.open(url, "_blank");    
  }

  const handleCancelSubscription = async () => {
    try {
      setError("");
      setBusy(true);

      await cancelSubscription(getDeviceInfo());
      await Promise.resolve(() => { setTimeout(() => null, 1000) });
      const updatedUser = await getUser(getDeviceInfo());
      setUser(updatedUser);

      showToast("Subscription cancelled successfully", "success");
    } catch(err) {
      await handleSessionError(err, 'cancelSubscription');
      logger.log(err);
      setError('Failed to unsubscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSubscribe = () => {
    router.push("/subscribe");
  }

  return (
    <div className="flex flex-1 justify-center items-center w-full">
      <Card className='w-full md:max-w-lg text-center p-4 m-4 items-center space-y-6 flex flex-col'>
        <Heading level={2}>Account</Heading>

        {error && <FormError message={error} />}

        {user.isPlus ? (
          <>
            <Button 
              onClick={handleShowBillingPortal}
              className="w-full max-w-md"
              disabled={!url}
            >
              {loading ? "Loading..." : "Go to Stripe Billing Portal"}
            </Button>
            <Button 
              onClick={handleCancelSubscription}
              className="w-full max-w-md"
            >
              Cancel Subscription
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleUpgradeToPlus}
            className="w-full max-w-md"
          >
            Upgrade to Mystyc Plus
          </Button>
        )}

         <Button 
            onClick={handleSubscribe}
            className="w-full max-w-md"
          >
            Subscribe
          </Button>
         
      </Card>
    </div>
  );
}