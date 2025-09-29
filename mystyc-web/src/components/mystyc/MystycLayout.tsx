'use client'

import { useUser } from '@/components/ui/context/AppContext';
import Main from '@/components/ui/layout/Main';
import MystycFooter from "@/components/mystyc/MystycFooter";
import ScrollWrapper from '@/components/ui/layout/scroll/ScrollWrapper';
import MystycNavigation from './ui/MystycNavigation';

export default function MystycLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  if (!user) {
    return null;
  }

  return(
    <div className='flex-1 flex flex-col w-full h-full overflow-hidden -mt-[59px]'>
      <ScrollWrapper className='z-10'>
        <div className='flex flex-row w-full max-w-content flex-grow pt-[59px] md:ml-4'>
          <MystycNavigation />
          <Main className='flex w-full flex-grow box-border mx-0 md:mx-4 md:-mt-10'>
            {children}
          </Main>
        </div>
        <div className={`${user && user.isOnboard ? 'mb-24' : ''} md:mb-0`}>
          <MystycFooter user={user} />
        </div>          
      </ScrollWrapper>
    </div>
  );  
}