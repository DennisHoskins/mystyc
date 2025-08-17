import { Sign } from 'mystyc-common/schemas';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Link from '@/components/ui/Link';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

export default function SignPanel({ sign } : { sign?: Sign | null }) {
  return (
    <AdminDetailField 
      key={sign?.sign}
      heading={sign?.sign}
      headingicon={getZodiacIcon(sign?.sign, "w-3 h-3")}
      headinghref={'/admin/astrology/signs/' + sign?.sign}
      value={
        <div className='flex flex-col space-y-2'>
          <Link href={'/admin/astrology/signs/' + sign?.sign} className='text-wrap !no-underline'>
            <span className='text-gray-100'>{sign?.description}</span>
            <br />
            <span className='text-xs text-gray-500'><strong>Keywords</strong> [{sign?.keywords.join(", ")}]</span>
          </Link>
          <div className='flex space-x-2'>
            <Capsule
              icon={<Energy size={2} />} 
              label={sign?.energyType || ''} 
              href={'/admin/astrology/energy-types/' + sign?.energyType} 
            />
          </div>
        </div>
      }
    />
  );
}
