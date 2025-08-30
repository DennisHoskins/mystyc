import { Users } from "lucide-react";

import Card from "@/components/ui/Card";
import Heading from "@/components/ui/Heading";
import { ZodiacSignType } from "mystyc-common";
import RelationshipPanel from "./RelationshipPanel";

export default function CompatibilityCard({ sign } : { sign: ZodiacSignType | null }) {

console.log(sign);

  return (
    <Card className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        <Users className="w-6 h-6 text-white" />
        <Heading level={3}>Compatibility</Heading>
      </div>
      <div className="grid grid-cols-6 grid-rows-2 gap-4">
        <RelationshipPanel sign='Aquarius' />
        <RelationshipPanel sign='Aries' />
        <RelationshipPanel sign='Cancer' />
        <RelationshipPanel sign='Capricorn' />
        <RelationshipPanel sign='Gemini' />
        <RelationshipPanel sign='Leo' />
        <RelationshipPanel sign='Libra' />
        <RelationshipPanel sign='Pisces' />
        <RelationshipPanel sign='Sagittarius' />
        <RelationshipPanel sign='Scorpio' />
        <RelationshipPanel sign='Taurus' />
        <RelationshipPanel sign='Virgo' />
      </div>
    </Card>
  )
}