import { Dynamic } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function DynamicDetailsPanel({ dynamic }: { dynamic?: Dynamic | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={3}>
        <AdminDetailField
          label="Score"
          value={dynamic?.scoreValue}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={1}>
        <AdminDetailField
          label="Keywords"
          value={"[" + dynamic?.keywords.join(", ") + "]"}
        />
        <AdminDetailField
          label="Description"
          value={dynamic?.description}
        />
      </AdminDetailGrid>
    </div>
  );
}