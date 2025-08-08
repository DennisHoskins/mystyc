import { Element } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ElementDetailsPanel({ element }: { element?: Element | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={3}>
        <AdminDetailField
          label="Energy Type"
          value={element?.energyType}
          href={`/admin/astrology/energy-types/${element?.energyType}`}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={1}>
        <AdminDetailField
          label="Keywords"
          value={"[" + element?.keywords.join(", ") + "]"}
        />
        <AdminDetailField
          label="Description"
          value={element?.description}
        />
      </AdminDetailGrid>
    </div>
  );
}