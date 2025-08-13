import { Planet } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function PlanetDetailsPanel({ planet }: { planet?: Planet | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={1} className='!gap-1'>
        <AdminDetailField
          value={planet?.description}
          type='description'
        />
        <AdminDetailField
          label="Importance"
          inline={true}
          text={planet?.importance.toString()}
        />
        <AdminDetailField
          label="Keywords"
          inline={true}
          text={planet?.keywords && "[" + planet?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </div>
  );
}