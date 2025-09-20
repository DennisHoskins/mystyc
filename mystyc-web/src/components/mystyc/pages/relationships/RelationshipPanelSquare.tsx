import { SignInteraction } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import RelationshipHeader from './RelationshipHeader';
import CompatibilityPanelSquare from './CompatibilityPanelSquare';

export default function RelationshipPanelSquare({ interaction } : { interaction: SignInteraction | null | undefined }) {
  return (
    <Panel className='!flex-col'>
      <RelationshipHeader interaction={interaction} dark={true} />
      <CompatibilityPanelSquare interaction={interaction} />
    </Panel>
  )
}