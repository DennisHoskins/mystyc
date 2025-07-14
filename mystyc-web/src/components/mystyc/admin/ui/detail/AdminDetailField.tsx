'use client';

import { ReactNode } from 'react';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';

interface AdminDetailFieldProps {
  label: string;
  value?: string | ReactNode | null;
  href?: string | null;
  text?: string | null;  
}

export default function AdminDetailField({ label, value, href, text }: AdminDetailFieldProps) {
  return (
    <div className='mb-4'>
      <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
        {label}
      </Text>

      {href ? (
        <Link href={href} className='block font-bold truncate'>{value || ''}</Link>
      ) : (
        <div className='truncate'>{value || ''}</div>
      )}

      {text && <Text variant='small' className='text-gray-400'>{text}</Text>}
    </div>
  );
}