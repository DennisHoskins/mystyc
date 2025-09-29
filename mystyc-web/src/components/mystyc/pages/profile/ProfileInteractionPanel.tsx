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
  score: number | null | undefined, 
  astrology?: PlanetaryData | undefined,
  totals?: { label: string, total: number | null | undefined, description?: string }[],
  data: PlanetaryCompleteData | undefined
}) {
  return (
    <div className='flex flex-col'>
      <Link href={href} className='flex items-center hover:!no-underline'>
        {getPlanetIcon(planet, "w-4 h-4 mr-2 text-white")}
        <Heading level={2} color='text-white'>{planet}: </Heading>
        <Heading level={2} color='text-white' className='ml-1'>{data?.sign}</Heading>
        {data && getZodiacIcon(data.sign, "w-5 h-5 ml-1 text-white")}
        <Text variant='xs' color='text-gray-300' className='ml-1 !mt-1'>{astrology && astrology?.degreesInSign + '°'}</Text>
      </Link>
      <Link href={href} className='flex flex-col hover:!no-underline'>
        <Text variant='small' color='text-gray-500' className="!mt-1 flex space-x-2 min-w-52">
          {data?.planetData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
        </Text>
        <Text variant='muted' color='text-gray-300' className='!mt-2'>{heading}: {subheading}</Text>

        <div className='!-mt-1 max-w-md'>
          <LinearGauge label='' score={score} />
        </div>

        <Text variant='muted' color='text-gray-400' className="!mt-2 !mb-4" loadingHeight={20}>{astrology?.summary?.description}</Text>

        {(totals && totals.length) &&
          <div className='flex flex-col space-y-4'>
            {totals?.map((total, i) => (
              <div key={i} className='flex space-x-4'>
                <Panel key={total.label} padding={4} className='justify-center items-center min-w-28 max-w-28'>
                  <RadialGauge label={total.label} size={100} totalScore={total.total} inline={true} />
                </Panel>
                <div className="flex flex-col w-full">
                  {astrology
                    ? <Heading level={3} className='flex items-center'><span className='hidden md:block'>{planet} - </span>{total.label}</Heading>
                    : <Heading level={3} className='flex items-center max-w-40 mb-1'></Heading>
                  }
                  <Text variant='muted' color="text-gray-400" loadingHeight={20}>{total.description}</Text>
                </div>
              </div>
            ))}
          </div>
        }
      </Link>
    </div>
  );
}
