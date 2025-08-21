'use client'

import { useEffect } from 'react';

import MenuButton from '@/components/ui/layout/menu/MenuButton';
import MystycMenu from '@/components/mystyc/ui/MystycMenu';

interface MystycMenuButtonProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function MystycMenuButton({ menuOpen, setMenuOpen }: MystycMenuButtonProps) {

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside both button and menu
      if (!target.closest('[data-menu-button]') && !target.closest('[data-menu-popup]')) {
        setMenuOpen(false);
      }
    };

    // Small delay to avoid closing immediately after opening
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuOpen, setMenuOpen]);

  return (
    <div className="flex space-x-4 ml-auto relative">
      <MenuButton 
        isOpen={menuOpen}
        onToggle={() => setMenuOpen(!menuOpen)}
      />
      
      {/* Desktop: Floating popup */}
      <div className={`hidden md:block absolute top-10 right-0 z-[100] w-64 bg-[var(--color-main-1)] border border-[var(--color-border)] text-purple-300 rounded-md shadow-lg transition-opacity duration-200 ease-in-out ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="p-4">
          <MystycMenu />
        </div>
      </div>
    </div>        
  );
}