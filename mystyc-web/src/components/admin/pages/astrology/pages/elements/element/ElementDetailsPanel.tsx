import { Element } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ElementDetailsPanel({ element }: { element?: Element | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={1} className='!gap-1'>
        <AdminDetailField
          value={element?.description}
          type='description'
        />
        <AdminDetailField
          label='Keywords'
          inline={true}
          text={element?.keywords && "[" + element?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </div>
  );
}