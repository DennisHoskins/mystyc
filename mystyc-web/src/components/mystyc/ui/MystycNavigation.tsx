import { usePathname } from 'next/navigation';
import { CalendarDays, SunMoon, Drama, BookHeart } from 'lucide-react';

import { useUser } from '@/components/ui/context/AppContext';
import UserStar from '@/components/ui/icons/UserStar';
import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';

export default function MystycNavigation() {
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
      text-white flex-1
      transition-all duration-300 ease-in-out
      hover:bg-purple-100 hover:!text-purple-800 hover:!no-underline
      ${active ? 'text-opacity-100' : 'text-opacity-50'}
    `.trim();
  };

  const getCardClasses = (path: string): string => {
    const active = isActive(path);
    return `
      !p-0 !py-4 md:!p-4 items-center justify-center md:aspect-square w-full
      transition-all duration-300 ease-in-out
      !border-0 md:!border ${active ? 'md:!border-white md:!border-opacity-100' : 'md:!border-white md:!border-opacity-15'}
    `.trim();
  };
  
  return (
    <div className='relative'>
      <div className='fixed bottom-0 left-0 w-full flex flex-row backdrop-blur-md md:sticky md:top-[59px] md:flex-col md:space-y-2 md:justify-start z-10'>
        <Link href='/' className={getLinkClasses('/')}>
          <Card className={getCardClasses('/')}>
            <SunMoon className='w-8 h-8' strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Insights</p>
          </Card>
        </Link>
        <Link href='/profile' className={getLinkClasses('/profile')}>
          <Card className={getCardClasses('/profile')}>
            <UserStar width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>
              <span className='md:inline hidden'>Star Profile</span>
              <span className='md:hidden inline'>Profile</span>
            </p>
          </Card>
        </Link>
        <Link href='/relationships' className={getLinkClasses('/relationships')}>
          <Card className={getCardClasses('/relationships')}>
            <Drama width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Relationships</p>
          </Card>
        </Link>
        <Link href='/calendar' className={getLinkClasses('/calendar')}>
          <Card className={getCardClasses('/calendar')}>
            <CalendarDays width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>Calendar</p>
          </Card>
        </Link>
        <Link href='/astrology' className={getLinkClasses('/astrology')}>
          <Card className={getCardClasses('/astrology')}>
            <BookHeart width={30} height={30} strokeWidth={1} />
            <p className='!mt-2 text-[10px] text-center font-bold'>
              <span className='md:inline hidden'>Astrology Library</span>
              <span className='md:hidden inline'>Astrology</span>
            </p>
          </Card>
        </Link>
      </div>
    </div>
  );
}