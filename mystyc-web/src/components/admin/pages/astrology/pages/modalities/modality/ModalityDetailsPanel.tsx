import { Modality } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ModalityDetailsPanel({ modality }: { modality?: Modality | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={1} className='!gap-1'>
        <AdminDetailField
          value={modality?.description}
          type='description'
        />
        <AdminDetailField
          label='Keywords'
          inline={true}
          text={modality?.keywords && "[" + modality?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </div>
  );
}