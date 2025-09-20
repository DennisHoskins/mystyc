import { Planet } from 'mystyc-common/schemas';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import Link from '@/components/ui/Link';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

export default function PlanetPanel({ planet } : { planet?: Planet | null }) {
  return (
    <AdminDetailField 
      key={planet?.planet}
      heading={planet?.planet}
      headingicon={getPlanetIcon(planet?.planet, "w-3 h-3")}
      headinghref={'/admin/astrology/planets/' + planet?.planet}
      value={
        <div className='flex flex-col space-y-2'>
          <Link href={'/admin/astrology/planets/' + planet?.planet} className='text-wrap !no-underline'>
            <span className='text-gray-100'>{planet?.description}</span>
            <br />
            <span className='text-xs text-gray-500'><strong>Keywords</strong> [{planet?.keywords.join(", ")}]</span>
          </Link>
          <div className='flex space-x-2'>
            <Capsule
              icon={<Energy size={2} />} 
              label={planet?.energyType || ''} 
              href={'/admin/astrology/energy-types/' + planet?.energyType} 
            />
          </div>
        </div>
      }
    />
  );
}
