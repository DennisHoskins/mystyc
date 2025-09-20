import { Element } from 'mystyc-common/schemas';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import Link from '@/components/ui/Link';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

export default function ElementPanel({ element } : { element?: Element | null }) {
  return (
    <AdminDetailField 
      key={element?.element}
      heading={element?.element}
      headingicon={getElementIcon(element?.element, "w-3 h-3")}
      headinghref={'/admin/astrology/elements/' + element?.element}
      value={
        <div className='flex flex-col space-y-2'>
          <Link href={'/admin/astrology/elements/' + element?.element} className='!text-gray-500 text-wrap !no-underline'>
            {element?.description}
            <br />
            <span className='text-xs'><strong>Keywords</strong> [{element?.keywords.join(", ")}]</span>
          </Link>
          <div className='flex space-x-2'>
            <Capsule
              icon={<Energy size={3} />} 
              label={element?.energyType || ''} 
              href={'/admin/astrology/energy-types/' + element?.energyType} 
            />
          </div>
        </div>
      }
    />
  );
}
