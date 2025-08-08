import { Planet } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function PlanetDetailsPanel({ planet }: { planet?: Planet | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={3}>
        <AdminDetailField
          label="Energy Type"
          value={planet?.energyType}
          href={`/admin/astrology/energy-types/${planet?.energyType}`}
        />
        <AdminDetailField
          label="Importance"
          value={planet?.importance}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={1}>
        <AdminDetailField
          label="Keywords"
          value={"[" + planet?.keywords.join(", ") + "]"}
        />
        <AdminDetailField
          label="Description"
          value={planet?.description}
        />
      </AdminDetailGrid>
    </div>
  );
}