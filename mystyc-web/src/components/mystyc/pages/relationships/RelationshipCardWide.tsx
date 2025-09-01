import { SignInteraction } from 'mystyc-common';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import RadialGauge from '../../ui/RadialGauge';
import LinearGauge from '../../ui/LinearGauge';
import Link from '@/components/ui/Link';
import RelationshipHeader from './RelationshipHeader';

export default function RelationshipCardWide({ interaction } : { interaction: SignInteraction }) {
  return (
    <Card className='!p-10'>
      <div className='grid grid-cols-4 gap-4'>
        <Link href={`/relationships/${interaction.sign2}`} className='h-full flex hover:!no-underline'>
          <Panel className='!p-4 justify-center'>
            <RadialGauge label='Compatible' totalScore={interaction.totalScore} />
          </Panel>
        </Link>

        <div className='col-span-3'>
          <RelationshipHeader interaction={interaction} />

          <Link href={`/relationships/${interaction.sign2}`} className='grid grid-cols-4 gap-2 mt-4 hover:!no-underline'>
            <Panel className='flex-col justify-center space-y-6 !p-4'>
              <LinearGauge score={interaction.dynamicScore} label="Dynamic" />
            </Panel>
            <Panel className='flex-col justify-center space-y-6 !p-4'>
              <LinearGauge score={interaction.elementScore} label="Element" />
            </Panel>
            <Panel className='flex-col justify-center space-y-6 !p-4'>
              <LinearGauge score={interaction.modalityScore} label="Modality" />
            </Panel>
            <Panel className='flex-col justify-center space-y-6 !p-4'>
              <LinearGauge score={interaction.polarityScore} label="Polarity" />
            </Panel>
          </Link>
        </div>
      </div>
    </Card>
  )
}