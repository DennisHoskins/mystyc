'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

import { Menu as MenuIcon, X } from 'lucide-react';
import styles from './Menu.module.css';

export default function Menu({ children, isFullWidth = false } : { children: React.ReactNode, isFullWidth?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(open => !open);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

return (
    <>
      <div ref={containerRef} className="relative">
        <button
          onClick={toggleMenu}
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          className={styles.button}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>
      {createPortal(
         <div className={`absolute inset-x-0 flex justify-end  ${isFullWidth ? 'w-full' : 'max-w-content'} mx-auto z-100`}>
          <div
            className={`${styles.menu} ${isOpen ? styles.open : styles.closed}`}
          >
          <div
              className="flex flex-col h-full p-4"
            >
              {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}