'use client';

import { useState } from "react";

import { apiClient } from "@/api/apiClient";
import { useBusy } from "@/components/ui/layout/context/AppContext";  
import { logger } from "@/util/logger";

import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/form/FormError";

export default function SubscribePage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);

  const upgradeToPlus = async () => {
    try {
      setError("");
      setBusy(true);
      const response = await apiClient.startSubscription();
      window.location.href = response.sessionUrl;
    } catch(err) {
      logger.log(err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
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

      {error && <FormError message={error} />}

      <Button 
        onClick={upgradeToPlus}
        className="w-full max-w-md"
      >
        Upgrade
      </Button>
    </div>
  );
}