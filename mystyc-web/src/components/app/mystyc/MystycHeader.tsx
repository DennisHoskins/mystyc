'use client';

import { usePathname } from 'next/navigation';

import { useUser } from '@/components/layout/context/AppContext';  
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import MenuComponent from '@/components/layout/menu/Menu';
import Button from '@/components/ui/Button';
import MystycMenu from './MystycMenu';

export default function AppHeader() {
  const pathname = usePathname();
  const user = useUser();
  const router = useTransitionRouter();

  const isAdminPath = pathname.startsWith('/admin');  
  const isAdmin = user && user.isAdmin && isAdminPath;

  return (
    <div className="flex space-x-4 ml-auto">
      <MenuComponent  isFullWidth={isAdmin == true}>
        <MystycMenu />
      </MenuComponent>
    </div>        
  );
}
