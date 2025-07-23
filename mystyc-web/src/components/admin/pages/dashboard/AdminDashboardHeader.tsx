import { ReactNode } from 'react';

import Heading from '@/components/ui/Heading';
import Avatar from '@/components/ui/Avatar';
import Link from '@/components/ui/Link';

interface AdminDashboardHeaderProps {
  icon: ReactNode;
  title: string;
  link?: string | null;
}

export default function AdminDashboardHeader({
  icon,
  title,
  link,
}: AdminDashboardHeaderProps) {
  return (
    <div className='flex flex-col sm:flex-row sm:space-x-3 items-center space-y-2 sm:space-y-0 mb-4'>
      {icon && (
        <div className='mt-1'>
          <Avatar size={'small'} icon={icon} />
        </div>
      )}
      {link ? (
        <Link href={link}>
          <Heading level={3}>{title}</Heading>
        </Link>
      ) : (
        <Heading level={3}>{title}</Heading>
      )}
    </div>
   )
}