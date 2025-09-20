import { PlanetInteraction } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function PlanetInteractionDetailsPanel({ interaction }: { interaction?: PlanetInteraction | null }) {
  return (
    <div className='space-y-4'>
      <Panel padding={4}>
        <AdminDetailGrid className='!gap-1'>
          <AdminDetailField
            value={interaction?.description}
            type='description'
          />
          <AdminDetailField
            label='Action'
            value={interaction?.action}
            type='description'
          />
          <AdminDetailField
            label='Keywords'
            inline={true}
            text={interaction?.keywords && "[" + interaction?.keywords.join(", ") + "]"}
          />
        </AdminDetailGrid>
      </Panel>
    </div>
  );
}