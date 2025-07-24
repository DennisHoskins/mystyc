'use client';

import Heading from '@/components/ui/Heading';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { IconComponent } from '@/components/ui/icons/Icon';

interface AdminTableHeaderProps {
  icon?: IconComponent | React.ReactNode;
  label?: string | null;
  totalItems?: number | null;
}

export default function AdminTableHeader({ icon, label, totalItems } : AdminTableHeaderProps){
  return (
    <div className='flex justify-between items-center mb-2'>
      <div className='flex space-x-2 items-center'>
        {icon && <Avatar size={'small'} icon={icon} />}
        <Heading level={5}>{label}</Heading>
      </div>
      {totalItems && <Badge total={totalItems} />}
    </div>
  );
}
