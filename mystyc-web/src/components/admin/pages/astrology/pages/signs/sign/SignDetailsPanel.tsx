import { Sign } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SignDetailsPanel({ sign }: { sign?: Sign | null }) {
  return (
    <div className='space-y-4'>
      <AdminDetailGrid cols={3}>
        <AdminDetailField
          label="Element"
          value={sign?.element}
          href={`/admin/astrology/elements/${sign?.element}`}
        />
        <AdminDetailField
          label="Modality"
          value={sign?.modality}
          href={`/admin/astrology/modalities/${sign?.modality}`}
        />
        <AdminDetailField
          label="Energy Type"
          value={sign?.energyType}
          href={`/admin/astrology/energy-types/${sign?.energyType}`}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={1}>
        <AdminDetailField
          label="Keywords"
          value={"[" + sign?.keywords.join(", ") + "]"}
        />
        <AdminDetailField
          label="Description"
          value={sign?.description}
        />
      </AdminDetailGrid>
    </div>
  );
}