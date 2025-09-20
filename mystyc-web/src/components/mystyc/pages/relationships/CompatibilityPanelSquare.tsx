import { SignInteraction } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import RadialGauge from '../../ui/RadialGauge';
import LinearGauge from '../../ui/LinearGauge';
import Link from '@/components/ui/Link';

export default function CompatibilityPanelSquare({ interaction } : { interaction: SignInteraction | null | undefined }) {
  return (
    <Link href={`/relationships/${interaction?.sign2}`} className='h-full flex hover:!no-underline !mt-4'>
      <Panel padding={4} className='grid grid-cols-3'>
        <div className='flex justify-center'>
          <RadialGauge label='Compatible' totalScore={interaction?.totalScore} inline={true} />
        </div>
        <div className='col-span-2 ml-4 md:ml-0'>
          <LinearGauge score={interaction?.dynamicScore} label="Dynamic" />
          <LinearGauge score={interaction?.elementScore} label="Element" />
          <LinearGauge score={interaction?.modalityScore} label="Modality" />
          <LinearGauge score={interaction?.polarityScore} label="Polarity" />
        </div>
      </Panel>
    </Link>
  )
}