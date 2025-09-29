import { House } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function HouseDetailsPanel({ house }: { house?: House | null }) {
  return (
    <Panel padding={4}>
      <AdminDetailGrid className='!gap-1'>
        <AdminDetailField
          value={house?.description}
          type='description'
        />
        <AdminDetailField
          label='Life Area'
          value={house?.lifeArea}
        />
        <AdminDetailField
          label='Natural Ruler'
          href={`/admin/astrology/signs/${house?.naturalRuler}`}
          value={house?.naturalRuler}
        />
        <AdminDetailField
          label='Keywords'
          inline={true}
          text={house?.keywords && "[" + house?.keywords.join(", ") + "]"}
        />
      </AdminDetailGrid>
    </Panel>
  );
}