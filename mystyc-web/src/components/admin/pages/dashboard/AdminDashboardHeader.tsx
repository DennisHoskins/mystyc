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
    <div className='flex flex-col sm:flex-row sm:space-x-3 items-center sm:space-y-0'>
      {icon && <Avatar size={'small'} icon={icon} />}
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