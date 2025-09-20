import { SignInteraction } from 'mystyc-common';
import Card from '@/components/ui/Card';
import RelationshipHeader from './RelationshipHeader';
import CompatibilityPanelTall from './CompatibilityPanelTall';

export default function RelationshipCardTall({ interaction, className } : { interaction: SignInteraction | null | undefined, className?: string }) {
  return (
    <Card className={`!flex-col ${className}`}>
      <RelationshipHeader interaction={interaction} />
      <CompatibilityPanelTall interaction={interaction} />
    </Card>
  )
}