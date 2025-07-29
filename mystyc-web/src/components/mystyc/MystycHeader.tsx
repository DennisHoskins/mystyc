'use client'

import { useState } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Header from '@/components/ui/layout/Header';
import MystycMenuButton from '@/components/mystyc/ui/MystycMenuButton';
import Menu from '@/components/ui/layout/menu/Menu';
import UITransition from '../ui/layout/transition/UITransition';

export default function MystycHeader({ user } : {user: AppUser }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header user={user}>
        <UITransition>      
          <MystycMenuButton 
            menuOpen={menuOpen} 
            setMenuOpen={setMenuOpen} 
          />
        </UITransition>
      </Header>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
