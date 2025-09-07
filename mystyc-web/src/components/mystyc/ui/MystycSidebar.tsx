'use client'

import { usePathname } from 'next/navigation';
import { CalendarDays, SunMoon, Drama, BookHeart } from 'lucide-react';

import { useUser } from '@/components/ui/context/AppContext';
import UserStar from '@/components/ui/icons/UserStar';
import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';

export default function MystycSidebar() {
  const user = useUser();
  const pathname = usePathname();
  if (!user || !user.isOnboard) {
    return null;
  }

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const getLinkClasses = (path: string): string => {
    const active = isActive(path);
    return `
      text-white
      transition-all duration-300 ease-in-out
      hover:bg-purple-100 hover:!text-purple-800 hover:!no-underline
      ${active ? 'text-opacity-100' : 'text-opacity-50'}
    `.trim();
  };

  const getCardClasses = (path: string): string => {
    const active = isActive(path);
    return `
      !p-4 items-center justify-center aspect-square
      transition-all duration-300 ease-in-out
      ${active ? '!border-white !border-opacity-100' : '!border-white !border-opacity-15'}
    `.trim();
  };

  return (
    <div className='relative'>
      <div className='sticky top-[59px] flex flex-col space-y-2'>
        <Link href='/' className={getLinkClasses('/')}>
          <Card className={getCardClasses('/')}>
            <SunMoon className='w-9 h-9' strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Insights</p>
          </Card>
        </Link>
        <Link href='/profile' className={getLinkClasses('/profile')}>
          <Card className={getCardClasses('/profile')}>
            <UserStar width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Star Profile</p>
          </Card>
        </Link>
        <Link href='/relationships' className={getLinkClasses('/relationships')}>
          <Card className={getCardClasses('/relationships')}>
            <Drama width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Relationships</p>
          </Card>
        </Link>
        <Link href='/forecast' className={getLinkClasses('/forecast')}>
          <Card className={getCardClasses('/forecast')}>
            <CalendarDays width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Forecast &amp; Planning</p>
          </Card>
        </Link>
        <Link href='/astrology' className={getLinkClasses('/astrology')}>
          <Card className={getCardClasses('/astrology')}>
            <BookHeart width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Reference Library</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}