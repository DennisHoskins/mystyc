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
  totals?: { label: string, total: number, description?: string }[],
  data: PlanetaryCompleteData 
}) {
  return (
    <div className='flex flex-col'>
      <Link href={href} className='flex items-center hover:!no-underline'>
        {getPlanetIcon(planet, "w-4 h-4 mr-2 text-white")}
        <Heading level={2} className='!text-white'>{planet}: </Heading>
        <Heading level={2} className='!text-white ml-1'>{data.sign}</Heading>
        {getZodiacIcon(data.sign, "w-5 h-5 ml-1 text-white")}
        <Text variant='xs' className='!text-gray-300 ml-1 !mt-1'>{astrology?.degreesInSign}°</Text>
      </Link>
      <Link href={href} className='flex flex-col hover:!no-underline'>
        <Text variant='small' className="!text-gray-500 !mt-1 flex space-x-2">
          {data.planetData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
        </Text>
        <Text variant='muted' className='!text-gray-300 !mt-2'>{heading}: {subheading}</Text>

        <div className='!mt-2 max-w-md'>
          <LinearGauge label='' score={score} />
        </div>

        {astrology?.summary?.description && 
          <Text variant='muted' className="!text-gray-400 !mt-2 !mb-4">{astrology.summary?.description}</Text>
        }     

        {(totals && totals.length) &&
          <div className='flex flex-col space-y-4 !mt-4'>
            {totals?.map((total) => (
              <div className='flex space-x-4'>
                <Panel key={total.label} className='!p-4 justify-center items-center max-w-32'>
                  <RadialGauge label={total.label} size={100} totalScore={total.total} inline={true} />
                </Panel>
                <div className="flex flex-col">
                  <Heading level={3}>{total.label}</Heading>
                  <Text variant='muted' className="!text-gray-400">{total.description}</Text>
                </div>
              </div>
            ))}
          </div>
        }
      </Link>
    </div>
  );
}
