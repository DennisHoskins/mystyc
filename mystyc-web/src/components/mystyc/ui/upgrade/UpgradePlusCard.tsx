'use client'

import { useTransitionRouter } from "@/hooks/useTransitionRouter"; 

import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function UpgradePlusCard() {
  const router = useTransitionRouter();

  return(
    <Card>
      <a
        href="/subscribe"
        onClick={() => router.push("/subscribe") }
        className="flex flex-col p-6 space-y-6 items-center hover:scale-[101%] transition-all"
      >
        <Heading level={3}>Dig Deeper</Heading>
        <Text className="max-w-xl">
          Get access to mystical insights that dive deeper into your zodiac traits, birth chart influences, and personal cosmic timeline - beyond daily guidance to truly personalized mystical coaching.
        </Text>

        <Text className="bg-gray-600 text-white p-2 rounded-full w-full max-w-lg mt-6">
          Upgrade To Mystyc Plus
        </Text>
      </a>
    </Card>
  );
}