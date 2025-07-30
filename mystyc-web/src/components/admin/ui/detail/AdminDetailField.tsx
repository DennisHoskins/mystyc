'use client'

import { ReactNode } from 'react';

import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';

interface AdminDetailFieldProps {
  label: string;
  value?: string | ReactNode | null;
  href?: string | null;
  text?: string | null;
  onClick?: () => void;  
  active?: boolean;
}

export default function AdminDetailField({ label, value, href, onClick, active = false, text }: AdminDetailFieldProps) {
  return (
    <div className='overflow-hidden'>
      <Text variant="small" className="font-light text-gray-500">
        {label}
      </Text>

      {href ? (
        <Link 
          href={href} 
          onClick={onClick} 
          className={`block truncate min-h-6 underline-offset-2 text-black ${active && "font-bold underline"}`}
        >
          {value || ''}
        </Link>
      ) : (
        <div className={`block truncate min-h-6 text-black ${active && "font-bold underline underline-offset-2"}`}>{value || ''}</div>
      )}

      {text && <Text variant='small' className='text-gray-400'>{text}</Text>}
    </div>
  );
}