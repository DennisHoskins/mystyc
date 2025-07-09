'use client';

import MenuButton from '@/components/layout/menu/MenuButton';
import MystycMenu from '@/components/app/mystyc/MystycMenu';

interface MystycHeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function AppHeader({ menuOpen, setMenuOpen }: MystycHeaderProps) {
  return (
    <div className="flex space-x-4 ml-auto relative">
      <MenuButton 
        isOpen={menuOpen}
        onToggle={() => setMenuOpen(!menuOpen)}
      />
      
      {/* Desktop: Floating popup */}
      <div className={`hidden md:block absolute top-10 right-0 z-[100] w-64 bg-white border border-gray-200 rounded-md shadow-lg transition-opacity duration-200 ease-in-out ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="p-4">
          <MystycMenu />
        </div>
      </div>
    </div>        
  );
}