'use client'

import { useUser } from '@/components/ui/context/AppContext';
import Main from '@/components/ui/layout/Main';
import MystycFooter from "@/components/mystyc/MystycFooter";
import ScrollWrapper from '@/components/ui/layout/scroll/ScrollWrapper';
import MystycSidebar from './ui/MystycSidebar';

export default function MystycLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  if (!user) {
    return null;
  }

  return(
    <div className='flex-1 flex flex-col w-full h-full overflow-hidden -mt-[59px]'>
      <ScrollWrapper className='z-10'>
        <div className='flex flex-row w-full max-w-content flex-grow pt-[59px]'>
          <MystycSidebar />
          <Main className='flex w-full flex-grow ml-8'>
            {children}
          </Main>
        </div>
        <MystycFooter user={user} />
      </ScrollWrapper>
    </div>
  );  
}