import { SquareStar } from 'lucide-react';

import { Sign } from "mystyc-common";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Panel from "@/components/ui/Panel";
import { getTarotIcon } from '@/components/ui/icons/astrology/tarot/';

export default function SignTarotPanel({ sign } : { sign: Sign | null }) {
  return (
    <div className="flex flex-col space-y-2 h-full">

      <div className='flex items-center space-x-2'>
        <SquareStar className='w-6 h-6 text-white' />
        <Heading level={3}>Tarot</Heading>
      </div>

      <Text variant='small' color="text-gray-500">{sign?.tarot.meaning}</Text>

      <div className="flex space-x-2 h-full !mt-2">
        <Panel className="!w-36 h-full !p-2 items-center justify-center">
          {getTarotIcon(sign?.tarot.majorArcana.replace("The ", ""), 'w-24 h-24 text-white')}
        </Panel>
        <div className="flex-1 flex flex-col space-y-2 p-2">
          <div>
            <Text variant='xs' color="text-gray-500">Major Arcana</Text>
            <Text variant='muted' color="text-gray-400">{sign?.tarot.majorArcana}</Text>
          </div>

          <div>
            <Text variant='xs' color="text-gray-500">Minor Arcana</Text>
            <Text variant='muted' color="text-gray-400">
              {sign?.tarot.minorArcana.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
            </Text>
          </div>

          <div>
            <Text variant='xs' color="text-gray-500">Court Cards</Text>
            <Text variant='muted' color="text-gray-400">
              {sign?.tarot.courtCards.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
            </Text>
          </div>      
        </div>
      </div>
   </div>
  );
}