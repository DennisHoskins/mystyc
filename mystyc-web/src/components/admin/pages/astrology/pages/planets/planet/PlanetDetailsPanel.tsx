import { Planet } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function PlanetDetailsPanel({ planet }: { planet?: Planet | null }) {
  return (
    <Panel padding={4}>
      <AdminDetailGrid className='!gap-1'>
        <AdminDetailField
          value={planet?.description}
          type='description'
        />
        <AdminDetailField
          label="Importance"
          inline={true}
          value={planet?.importance.toString()}
        />
        <AdminDetailField
          label="Keywords"
          inline={true}
          text={planet?.keywords && "[" + planet?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </Panel>
  );
}