'use client'

import { ReactNode } from 'react';

import styles from './Sidebar.module.css';
import SidebarToggleButton from './SidebarToggleButton';

interface SidebarProps {
  children: ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void | null;
  className?: string;
}

export default function Sidebar({ 
  children, 
  isCollapsed = false, 
  onToggle,
  className = '' 
}: SidebarProps) {
  return (
    <div className='relative'>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${className} hidden md:flex sticky top-[59px] rounded-md flex-col self-start flex-shrink-0 text-purple-300 z-50`}>
        {onToggle &&
          <SidebarToggleButton isCollapsed={isCollapsed} onToggle={onToggle} />
        }
        <nav className={`${styles.nav} rounded-md flex flex-col ${onToggle ? 'p-4 pt-0' : ''}`}>
          {children}
        </nav>
      </aside>
    </div>
  );
}