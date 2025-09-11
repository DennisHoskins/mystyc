import { SignInteraction } from 'mystyc-common';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import { formatStringForDisplay } from '@/util/util';
import Link from '@/components/ui/Link';

const getDistanceLabel = (distance: number): string => {
  const distanceMap: Record<number, { numeral: string; name: string }> = {
    0: { numeral: 'Ⅰ', name: 'Conjunction' },
    1: { numeral: 'Ⅱ', name: 'Semisextile (30°)' },
    2: { numeral: 'Ⅲ', name: 'Sextile (60°)' },
    3: { numeral: 'Ⅳ',name: 'Square (90°)' },
    4: { numeral:  'Ⅴ',name: 'Trine (120°)' },
    5: { numeral:  'Ⅵ', name: 'Quincunx (150°)' },
    6: { numeral: 'Ⅶ', name: 'Opposition (180°)' }
  };
  
  const distanceInfo = distanceMap[distance];
  return distanceInfo ? `${distanceInfo.numeral} - ${distanceInfo.name}` : `${distance}`;
};

export default function RelationshipHeader({ interaction, dark = false } : { interaction: SignInteraction, dark?: boolean }) {
  return (
    <div>
      <Link href={`/relationships/${interaction.sign2}`} className='flex items-center space-x-1 hover:!no-underline'>
        {getZodiacIcon(interaction.sign2, 'w-10 h-10 text-gray-300')}
        <Heading level={1}>{interaction.sign2}</Heading>
        <Heading level={3} className='!text-gray-300'><span className='hidden md:visible'> - {formatStringForDisplay(interaction.dynamic)}</span></Heading>
        {getDynamicIcon(interaction.dynamic, 'w-4 h-4 text-gray-300 hidden md:visible')}
      </Link>

      <Link href={`/relationships/${interaction.sign2}`} className='flex items-center space-x-1 hover:!no-underline md:hidden !mb-2'>
        <Heading level={4} className='!text-gray-300'>{formatStringForDisplay(interaction.dynamic)}</Heading>
        {getDynamicIcon(interaction.dynamic, 'w-4 h-4 text-gray-300')}
      </Link>

      <Link href={`/relationships/${interaction.sign2}`} className='hover:!no-underline'>
        <Text variant='small' className={`${dark ? "" : "!text-gray-500"} !mt-1 flex space-x-2`}>
          {interaction.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
        </Text>
        <Text variant='muted' className={`text-white flex space-x-2 !mt-2`}>
          {getDistanceLabel(interaction.distance)}
        </Text>
        <Text variant='muted' className={`${dark ? "" : "!text-gray-400"} mt-2`}>{interaction.description}</Text>
        <Text variant='xs' className={`${dark ? "text-gray-600" : "!text-gray-500"}  mt-2`}>Keys to success</Text>
        <Text variant='muted' className={`${dark ? "" : "!text-gray-400"}`}>{interaction.action}</Text>
      </Link>
    </div>
  );
}