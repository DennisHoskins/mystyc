import { PlanetaryPosition } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function PlanetaryPositionDetailsPanel({ position }: { position?: PlanetaryPosition | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={1} className='!gap-1'>
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
    </div>
  );
}