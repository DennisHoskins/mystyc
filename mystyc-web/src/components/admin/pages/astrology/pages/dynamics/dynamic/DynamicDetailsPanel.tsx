import { Dynamic } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function DynamicDetailsPanel({ dynamic }: { dynamic?: Dynamic | null }) {
  return (
    <AdminDetailGrid cols={1} className='!gap-1'>
      <AdminDetailField
        value={dynamic?.description}
        type='description'
      />
      <AdminDetailField
        label="Score"
        inline={true}
        text={dynamic?.scoreValue.toString()}
      />
      <AdminDetailField
        label="Keywords"
        inline={true}
        text={dynamic?.keywords && "[" + dynamic?.keywords.join(", ") + "]"}
      />
    </AdminDetailGrid>
  );
}