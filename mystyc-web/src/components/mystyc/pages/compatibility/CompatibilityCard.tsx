import { Users } from "lucide-react";

import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import { ZodiacSignType } from "mystyc-common";
import CompatibilityPanel from "./CompatibilityPanel";

export default function CompatibilityCard({ sign } : { sign: ZodiacSignType | null }) {
  return (
    <Card className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        <Users className="w-6 h-6 text-white" />
        <Heading level={3}>Compatibility</Heading>
      </div>
      <div className="grid grid-cols-6 grid-rows-2 gap-4">
        <CompatibilityPanel sign='Aquarius' />
        <CompatibilityPanel sign='Aries' />
        <CompatibilityPanel sign='Cancer' />
        <CompatibilityPanel sign='Capricorn' />
        <CompatibilityPanel sign='Gemini' />
        <CompatibilityPanel sign='Leo' />
        <CompatibilityPanel sign='Libra' />
        <CompatibilityPanel sign='Pisces' />
        <CompatibilityPanel sign='Sagittarius' />
        <CompatibilityPanel sign='Scorpio' />
        <CompatibilityPanel sign='Taurus' />
        <CompatibilityPanel sign='Virgo' />
      </div>
    </Card>
  )
}