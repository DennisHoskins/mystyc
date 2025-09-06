import { PlanetaryCompleteData, PlanetaryData, PlanetType } from 'mystyc-common';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';
import LinearGauge from '../../ui/LinearGauge';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Panel from '@/components/ui/Panel';
import RadialGauge from '../../ui/RadialGauge';

export default function ProfileInteractionPanel({ href, planet, heading, subheading, score, astrology, totals, data } : { 
  href: string,
  planet: PlanetType, 
  heading: string,
  subheading: string,
  score: number, 
  astrology?: PlanetaryData | undefined,
  totals?: { label: string, total: number }[],
  data: PlanetaryCompleteData 
}) {
  return (
    <div className='flex flex-col'>
      <Link href={href} className='flex items-center hover:!no-underline'>
        {getPlanetIcon(planet, "w-4 h-4 mr-2 text-white")}
        <Heading level={2} className='!text-white'>{planet}: </Heading>
        <Heading level={2} className='!text-white ml-1'>{data.sign}</Heading>
        {getZodiacIcon(data.sign, "w-5 h-5 ml-1 text-white")}
      </Link>
      <Link href={href} className='flex flex-col hover:!no-underline'>
        <Text variant='small' className="!text-gray-500 !mt-1 flex space-x-2">
          {data.planetData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
        </Text>
        <Text variant='muted' className='!text-gray-300 !mt-2'>{heading}: {subheading}</Text>

        <div className='!mt-4 max-w-md'>
          <LinearGauge label='' score={score} />
        </div>

        {astrology?.summary?.description && 
          <Text variant='muted' className="!text-gray-400 !mt-4 !mb-4">{astrology.summary?.description}</Text>
        }     

        {(totals && totals.length) &&
          <div className='grid grid-cols-4 gap-2 !mt-4'>
            {totals?.map((total) => (
              <Panel key={total.label} className='!p-4 justify-center items-center'>
                <Text variant='xs' className='!text-gray-500'>{total.label}</Text>
                <RadialGauge label={total.label} totalScore={total.total} inline={true} />
              </Panel>
            ))}
          </div>
        }
      </Link>
    </div>
  );
}
