import { Sign } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SignDetailsPanel({ sign, showLinks = true }: { sign?: Sign | null, showLinks?: boolean }) {
  return (
    <div className='space-y-4'>
      {showLinks &&
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
      }
      <AdminDetailGrid cols={1} className='!gap-1'>
        <AdminDetailField
          value={sign?.description}
          type='description'
        />
        <AdminDetailField
          label="Keywords"
          inline={true}
          text={sign?.keywords && "[" + sign?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </div>
  );
}