import { Polarity } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function PolarityDetailsPanel({ polarity }: { polarity?: Polarity | null }) {
  return (
    <Panel padding={4}>
      <AdminDetailGrid className='!gap-1'>
        <AdminDetailField
          value={polarity?.description}
          type='description'
        />
        <AdminDetailField
          label='Alternative Name'
          value={polarity?.alternativeName}
          type='description'
        />
        <AdminDetailField
          label='Keywords'
          inline={true}
          text={polarity?.keywords && "[" + polarity?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </Panel>
  );
}