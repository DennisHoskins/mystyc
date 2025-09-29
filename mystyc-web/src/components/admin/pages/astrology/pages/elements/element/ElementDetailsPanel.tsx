import { Element } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function ElementDetailsPanel({ element }: { element?: Element | null }) {
  return (
    <Panel padding={4}>
      <AdminDetailGrid className='!gap-1'>
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
    </Panel>
  );
}