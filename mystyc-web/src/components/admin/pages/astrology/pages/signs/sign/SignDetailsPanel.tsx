import { Sign } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function SignDetailsPanel({ sign }: { sign?: Sign | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid className='!gap-1'>
        <Panel padding={4}>
          <AdminDetailField
            value={sign?.description}
            type='description'
          />
          <AdminDetailField
            label="Keywords"
            inline={true}
            text={sign?.keywords && "[" + sign?.keywords.join(", ") + "]"}
          />
        </Panel>
      </AdminDetailGrid>
    </div>
  );
}