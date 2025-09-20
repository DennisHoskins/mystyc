import { Modality } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function ModalityDetailsPanel({ modality }: { modality?: Modality | null }) {
  return (
    <Panel padding={4}>
      <AdminDetailGrid className='!gap-1'>
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
    </Panel>
  );
}