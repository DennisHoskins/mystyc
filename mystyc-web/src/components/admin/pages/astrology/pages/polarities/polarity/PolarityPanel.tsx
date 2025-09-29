import { Polarity } from 'mystyc-common/schemas';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getPolarityIcon } from '@/components/ui/icons/astrology/polarities';
import Link from '@/components/ui/Link';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

export default function PolarityPanel({ polarity } : { polarity?: Polarity | null }) {
  return (
    <AdminDetailField 
      key={polarity?.polarity}
      heading={polarity?.polarity}
      headingicon={getPolarityIcon(polarity?.polarity, "w-3 h-3")}
      headinghref={'/admin/astrology/polarities/' + polarity?.polarity}
      value={
        <div className='flex flex-col space-y-2'>
          <Link href={'/admin/astrology/polarities/' + polarity?.polarity} className='text-wrap !no-underline'>
            <span className='text-gray-100'>{polarity?.description}</span>
            <br />
            <span className='text-xs text-gray-500'><strong>Keywords</strong> [{polarity?.keywords.join(", ")}]</span>
          </Link>
          <div className='flex space-x-2'>
            <Capsule
              icon={<Energy size={3} />} 
              label={polarity?.energyType || ''} 
              href={'/admin/astrology/energy-types/' + polarity?.energyType} 
            />
          </div>
        </div>
      }
    />
  );
}
