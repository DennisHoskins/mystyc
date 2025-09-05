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
  score: number, 
  interaction: PlanetInteractionComplete 
}) {
  return (
    <>
      <div className='flex items-center space-x-2'>
        {getPlanetIcon(planet1, "w-4 h-4 text-white")}
        {getPlanetIcon(planet2, "w-4 h-4 text-white")}
        <Heading level={3} className='!text-white'>{planet1} - {planet2}</Heading>
      </div>

      <Text variant='small' className="!text-gray-300 !mt-1 flex space-x-2">
        {heading}
      </Text>

      <Text variant='small' className="!text-gray-400 !mt-1 flex space-x-2">
        {interaction.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <div className='!mt-2 max-w-md'>
        <LinearGauge label='' score={score} />
      </div>

      <Text variant='muted' className="!mt-2">{interaction.description}</Text>

      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} className='!text-gray-300'>Dynamic: {formatStringForDisplay(interaction.dynamic)}</Heading>
        {getDynamicIcon(interaction.dynamic, 'w-3 h-3 text-gray-300')}
      </div>

      <Text variant='xs' className="!text-gray-400 !mt-2">Keys to success</Text>
      <Text variant='muted' className="!mt-0">{interaction.action}</Text>
    </>
  );
}
