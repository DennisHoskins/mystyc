import { PlanetaryCompleteData, PlanetaryPositionComplete, PlanetType, ZodiacSignType } from 'mystyc-common';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import { getSignIcon } from '@/components/ui/icons/astrology/signs';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import RadialGauge from '../../../ui/RadialGauge';
import LinearGauge from '../../../ui/LinearGauge';

export default function PlanetInteractionCard({ data, planet, sign, total, totals, postion, component, children } : { 
  data?: PlanetaryCompleteData | null | undefined,
  planet: PlanetType,
  sign: ZodiacSignType | null | undefined, 
  total: number | null | undefined, 
  totals: {label: string, total: number | null | undefined}[],
  postion: PlanetaryPositionComplete | null | undefined,
  component?: React.ReactNode,
  children?: React.ReactNode
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4'>
      <Panel className='!flex-row md:!flex-col justify-center items-center'>
        <div>
          <RadialGauge label={planet} size={150} totalScore={total} inline={true} />
        </div>
        <div className='flex flex-col ml-4 md:ml-0 md:!mt-4 w-full flex-1 md:flex-none'>
            {totals.map((total, i) => (
              <LinearGauge key={i} score={total.total} label={total.label} />
            ))}
        </div>
      </Panel>
      <Card className='md:col-span-3 space-y-4'>
        <div className='flex flex-col'>
          <div className='flex space-x-4'>
            
            <div className='flex flex-col w-full'>
              <Link href={`/astrology/signs/${sign}`} className='flex items-center space-x-2 hover:!no-underline'>
                {sign && getZodiacIcon(sign, 'w-8 h-8 text-white')}
                <Heading level={2}>{(planet && sign) && `${planet} - ${sign}`}</Heading>
              </Link>

              <Text variant='small' color='text-gray-500' className="!mt-1 flex space-x-2 min-w-52">
                {postion?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
              </Text>

              <Text variant='muted' color='text-gray-400' className="!mt-2 !mb-4 w-full" loadingHeight={15}>{postion?.description}</Text>

              <div className='flex items-center space-x-2 !mt-2'>
                {(planet && sign) && getPlanetIcon(planet, 'w-4 h-4 text-white')}
                <Heading level={3}>{(planet && sign) && `${planet}`}</Heading>
              </div>
              <Text variant='muted' color='text-gray-400' className="!mb-4" loadingHeight={15}>{data?.planetData?.description}</Text>

              <div className='flex items-center space-x-2 !mt-2'>
                {data?.signData?.symbol.name && getSignIcon(data?.signData?.symbol.name, 'w-4 h-4 text-white')}
                <Heading level={3}>{sign}</Heading>
              </div>
              <Text variant='muted' color="text-gray-400" loadingHeight={15}>{data?.signData?.description}</Text>

              {component}
            </div>
          </div>
          {children}
          </div>
      </Card>
    </div>
  );
}
