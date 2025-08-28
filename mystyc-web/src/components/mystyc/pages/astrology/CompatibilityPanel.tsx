import { Users } from "lucide-react";

import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import { ZodiacSignType } from "mystyc-common";

export default function CompatibilityPanel({ sign } : { sign: ZodiacSignType | null }) {

  return (
    <Panel className="flex flex-col">
      <div className='flex items-center space-x-2'>
        <Users className="w-6 h-6 text-white" />
        <Heading level={3}>Compatibility</Heading>
      </div>
      <Text variant='muted'>{sign}</Text>
    </Panel>
  )
}