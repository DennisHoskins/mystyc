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
  data?: PlanetaryCompleteData,
  planet: PlanetType,
  sign: ZodiacSignType, 
  total: number, 
  totals: {label: string, total: number}[],
  postion: PlanetaryPositionComplete,
  component?: React.ReactNode,
  children?: React.ReactNode
}) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4'>
      <Panel className='!flex-row md:!flex-col justify-center items-center'>
        <div>
          <RadialGauge label={planet} size={150}  totalScore={total} inline={true} />
        </div>
        <div className='flex flex-col ml-4 md:ml-0 md:!mt-4 w-full flex-1 md:flex-none'>
            {totals.map((total, i) => (
              <LinearGauge key={i} score={total.total} label={total.label} />
            ))}
        </div>
      </Panel>
      <Card className='!p-4 md:!p-10 md:col-span-3 space-y-4'>
        <div className='flex flex-col'>
          <div className='flex space-x-4'>
            
            <div className='flex flex-col'>
              <Link href={`/astrology/signs/${sign}`} className='flex items-center space-x-2 hover:!no-underline'>
                {getZodiacIcon(sign, 'w-8 h-8 text-white')}
                <Heading level={2}>{planet} - {sign}</Heading>
              </Link>

              <Text variant='small' className="!text-gray-500 !mt-1 flex space-x-2">
                {postion.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
              </Text>

              <Text variant='muted' className="!text-gray-400 !mt-2 !mb-4">{postion.description}</Text>

              <div className='flex items-center space-x-2 !mt-2'>
                {getPlanetIcon(planet, 'w-4 h-4 text-white')}
                <Heading level={3}>{planet}</Heading>
              </div>
              <Text variant='muted' className="!text-gray-400 !mb-4">{data?.planetData?.description}</Text>

              <div className='flex items-center space-x-2 !mt-2'>
                {getSignIcon(data?.signData?.symbol.name, 'w-4 h-4 text-white')}
                <Heading level={3}>{sign}</Heading>
              </div>
              <Text variant='muted' className="!text-gray-400">{data?.signData?.description}</Text>

              {component}
            </div>
          </div>
          {children}
          </div>
      </Card>
    </div>
  );
}
