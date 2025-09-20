import { EnergyType } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function EnergyTypeDetailsPanel({ energyType, showCategory = true }: { energyType?: EnergyType | null, showCategory?: boolean }) {
  return (
    <Panel padding={4}>
      {showCategory &&
        <AdminDetailGrid cols={2}>
          <AdminDetailField
            label="Category"
            value={energyType?.category}
          />
          <AdminDetailField
            label="Intensity"
            value={energyType?.intensity}
          />
        </AdminDetailGrid>
      }
      <AdminDetailGrid className='!gap-1'>
        <AdminDetailField
          value={energyType?.description}
          type='description'
        />
        <AdminDetailField
          label='Keywords'
          inline={true}
          text={energyType?.keywords && "[" + energyType?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </Panel>
  );
}