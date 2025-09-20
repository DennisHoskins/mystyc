import { PlanetInteractionComplete, PlanetType } from 'mystyc-common';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import { formatStringForDisplay } from '@/util/util';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import LinearGauge from '../../../ui/LinearGauge';

export default function PlanetInteractionPanel({ planet1, planet2, heading, score, interaction } : { 
  planet1: PlanetType, 
  planet2: PlanetType, 
  heading: string,
  score: number | null | undefined, 
  interaction: PlanetInteractionComplete | null | undefined
}) {
  return (
    <>
      <div className='flex items-center space-x-2'>
        {planet1 && getPlanetIcon(planet1, "w-4 h-4 text-white")}
        {planet2 && getPlanetIcon(planet2, "w-4 h-4 text-white")}

        <Heading level={3} color='text-white'>{(planet1 && planet2) && `${planet1} - ${planet2}`}</Heading>
      </div>

      <Text variant='small' color='text-gray-300' className="!mt-1 flex space-x-2">
        {heading}
      </Text>

      <Text variant='small' color='text-gray-500' className="!mt-1 flex space-x-2">
        {interaction?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <div className='!-mt-1 max-w-md'>
        <LinearGauge label='' score={score} />
      </div>

      <Text variant='muted' color='text-gray-400' className="!mt-2" loadingHeight={20}>{interaction?.description}</Text>

      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} color='text-gray-300'>{interaction && `Dynamic: ${formatStringForDisplay(interaction?.dynamic)}`}</Heading>
        {getDynamicIcon(interaction?.dynamic, 'w-3 h-3 text-gray-300')}
      </div>

      <Text variant='xs' color='text-gray-500' className="!mt-2">Keys to success</Text>
      <Text variant='muted' color='text-gray-400' className="!mt-0" loadingHeight={15}>{interaction?.action}</Text>
    </>
  );
}
