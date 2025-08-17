import { Dynamic } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function DynamicDetailsPanel({ dynamic }: { dynamic?: Dynamic | null }) {
  return (
    <Panel>
      <AdminDetailGrid className='!gap-1'>
        <AdminDetailField
          value={dynamic?.description}
          type='description'
        />
        <AdminDetailField
          label="Score"
          inline={true}
          value={dynamic?.scoreValue.toString()}
        />
        <AdminDetailField
          label="Keywords"
          inline={true}
          text={dynamic?.keywords && "[" + dynamic?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </Panel>
  );
}