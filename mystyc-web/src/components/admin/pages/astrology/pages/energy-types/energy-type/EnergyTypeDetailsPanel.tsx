import { EnergyType } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function EnergyTypeDetailsPanel({ energyType }: { energyType?: EnergyType | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={3}>
        <AdminDetailField
          label="Category"
          value={energyType?.category}
        />
        <AdminDetailField
          label="Intensity"
          value={energyType?.intensity}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={1}>
        <AdminDetailField
          label="Keywords"
          value={"[" + energyType?.keywords.join(", ") + "]"}
        />
        <AdminDetailField
          label="Description"
          value={energyType?.description}
        />
      </AdminDetailGrid>
    </div>
  );
}