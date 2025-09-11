'use client'

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import MystycMenu from '@/components/mystyc/ui/MystycMenu';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  // Close menu when path changes
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      onClose();
    }
    prevPathname.current = pathname;
  }, [pathname, onClose]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div 
        className={`md:hidden fixed top-16 -left-10 right-0 bottom-0 z-[49] bg-[var(--color-main)] text-purple-300 shadow-[inset_0_10px_15px_-5px_rgba(0,0,0,0.1),inset_0_10px_10px_-5px_rgba(0,0,0,0.04)] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-75 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      <div className={`md:hidden fixed top-0 right-0 bottom-0 w-[60%] bg-[var(--color-main-1)] text-purple-300 z-[50] shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-[110%]'
      }`}>
        <div className="flex flex-col h-full p-4 ">
          <MystycMenu />
        </div>
      </div>
    </>
  );
}