import { Modality } from 'mystyc-common/schemas';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import Link from '@/components/ui/Link';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

export default function ModalityPanel({ modality } : { modality?: Modality | null }) {
  return (
    <AdminDetailField 
      key={modality?.modality}
      heading={modality?.modality}
      headingicon={getModalityIcon(modality?.modality, "w-3 h-3")}
      headinghref={'/admin/astrology/modalities/' + modality?.modality}
      value={
        <div className='flex flex-col space-y-2'>
          <Link href={'/admin/astrology/modalities/' + modality?.modality} className='text-wrap !no-underline'>
            <span className='text-gray-100'>{modality?.description}</span>
            <br />
            <span className='text-xs text-gray-500'><strong>Keywords</strong> [{modality?.keywords.join(", ")}]</span>
          </Link>
          <div className='flex space-x-2'>
            <Capsule
              icon={<Energy size={3} />} 
              label={modality?.energyType || ''} 
              href={'/admin/astrology/energy-types/' + modality?.energyType} 
            />
          </div>
        </div>
      }
    />
  );
}
