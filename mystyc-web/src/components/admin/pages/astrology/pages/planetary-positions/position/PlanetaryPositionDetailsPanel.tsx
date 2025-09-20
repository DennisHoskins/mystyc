import { PlanetaryPosition } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function PlanetaryPositionDetailsPanel({ position }: { position?: PlanetaryPosition | null }) {
  return (
    <Panel padding={4}>
      <AdminDetailGrid className='!gap-1'>
        <AdminDetailField
          value={position?.description}
          type='description'
        />
        <AdminDetailField
          label='Keywords'
          inline={true}
          text={position?.keywords && "[" + position?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </Panel>
  );
}