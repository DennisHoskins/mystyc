import { SignInteraction } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import RadialGauge from '../../ui/RadialGauge';
import LinearGauge from '../../ui/LinearGauge';
import Link from '@/components/ui/Link';

export default function CompatibilityPanelTall({ interaction } : { interaction: SignInteraction | null | undefined }) {
  return (
    <Link href={`/relationships/${interaction?.sign2}`} className='h-full flex hover:!no-underline !mt-4'>
      <Panel padding={4} className='!flex-row md:!flex-col justify-center'>
        <RadialGauge label='Compatible' totalScore={interaction?.totalScore} inline={true} />
        <div className='pl-4 md:p-6 md:!pt-2 w-full md:flex-1'>
          <LinearGauge score={interaction?.dynamicScore} label="Dynamic" />
          <LinearGauge score={interaction?.elementScore} label="Element" />
          <LinearGauge score={interaction?.modalityScore} label="Modality" />
          <LinearGauge score={interaction?.polarityScore} label="Polarity" />
        </div>
      </Panel>
    </Link>
  )
}