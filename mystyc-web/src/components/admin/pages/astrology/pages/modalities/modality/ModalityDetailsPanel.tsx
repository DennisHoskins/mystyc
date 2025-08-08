import { Modality } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ModalityDetailsPanel({ modality }: { modality?: Modality | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={3}>
        <AdminDetailField
          label="Energy Type"
          value={modality?.energyType}
          href={`/admin/astrology/energy-types/${modality?.energyType}`}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={1}>
        <AdminDetailField
          label="Keywords"
          value={"[" + modality?.keywords.join(", ") + "]"}
        />
        <AdminDetailField
          label="Description"
          value={modality?.description}
        />
      </AdminDetailGrid>
    </div>
  );
}