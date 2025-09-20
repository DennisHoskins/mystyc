import { SignInteraction } from 'mystyc-common';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import RadialGauge from '../../ui/RadialGauge';
import LinearGauge from '../../ui/LinearGauge';
import Link from '@/components/ui/Link';
import RelationshipHeader from './RelationshipHeader';
import Text from '@/components/ui/Text';

export default function RelationshipCardWide({ interaction } : { interaction: SignInteraction | null | undefined }) {
  return (
    <Card>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Link href={`/relationships/${interaction?.sign2}`} className='h-full flex hover:!no-underline order-2 md:order-1'>
          <Panel padding={4} className='grid grid-cols-3'>
            <div className='flex flex-col justify-center items-center col-span-1 md:col-span-3'>
              <RadialGauge label='' totalScore={interaction?.totalScore} />
              <Text variant='xs' className='hidden md:block text-gray-600 mt-8'>Compatible</Text>
            </div>
            <div className='col-span-2 ml-4 md:ml-0 md:hidden'>
              <LinearGauge score={interaction?.dynamicScore} label="Dynamic" />
              <LinearGauge score={interaction?.elementScore} label="Element" />
              <LinearGauge score={interaction?.modalityScore} label="Modality" />
              <LinearGauge score={interaction?.polarityScore} label="Polarity" />
            </div>
          </Panel>
        </Link>
        <div className='md:col-span-3 order-1 md:order-2'>
          <RelationshipHeader interaction={interaction} />
          <Link href={`/relationships/${interaction?.sign2}`} className='hidden md:grid grid-cols-4 gap-2 mt-4 hover:!no-underline'>
            <Panel padding={4} className='flex-col justify-center space-y-6'>
              <LinearGauge score={interaction?.dynamicScore} label="Dynamic" />
            </Panel>
            <Panel padding={4} className='flex-col justify-center space-y-6'>
              <LinearGauge score={interaction?.elementScore} label="Element" />
            </Panel>
            <Panel padding={4} className='flex-col justify-center space-y-6'>
              <LinearGauge score={interaction?.modalityScore} label="Modality" />
            </Panel>
            <Panel padding={4} className='flex-col justify-center space-y-6'>
              <LinearGauge score={interaction?.polarityScore} label="Polarity" />
            </Panel>
          </Link>
        </div>
      </div>
    </Card>
  );
}