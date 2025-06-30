'use client';

import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';

interface AdminDetailFieldProps {
  label: string;
  value?: string | null;
  href?: string | null;
  text?: string | null;  
}

export default function AdminDetailField({ label, value, href, text }: AdminDetailFieldProps) {
  return (
    <div>
      <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
        {label}
      </Text>

      {href ? <Link href={href} className='block truncate'>{value || ''}</Link> : <Text className='truncate'>{value || ''}</Text>}

      {text && <Text variant='small' className='text-gray-400'>{text}</Text>}
    </div>
  );
}