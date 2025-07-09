'use client';

import { useEffect } from 'react';

import MystycMenu from '@/components/app/mystyc/MystycMenu';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Menu({ isOpen, onClose }: MenuProps) {
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

  // Don't return null - render for animations

  return (
    <>
      {/* Mobile: Backdrop */}
      <div 
        className={`md:hidden fixed inset-0 bg-black z-[60] transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-25 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Mobile: Slide-in menu */}
      <div className={`md:hidden fixed top-16 right-0 bottom-0 w-[80%] bg-white z-[60] shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-[110%]'
      }`}>
        <div className="flex flex-col h-full p-4">
          <MystycMenu />
        </div>
      </div>
    </>
  );
}