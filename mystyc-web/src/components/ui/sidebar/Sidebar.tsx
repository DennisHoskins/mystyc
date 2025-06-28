'use client';

import { ReactNode } from 'react';
import styles from './Sidebar.module.css';
import SidebarToggleButton from './SidebarToggleButton';

interface SidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function Sidebar({ 
  children, 
  isOpen = true, 
  isCollapsed = false, 
  onToggle = () => {},
  className = '' 
}: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isOpen ? styles.open : styles.closed} ${className} fixed rounded-md m-4 mr-0 shadow-sm bg-white flex flex-col self-start`}>
      <SidebarToggleButton isCollapsed={isCollapsed} onToggle={onToggle} />
      <nav className={`${styles.nav} rounded-md`}>
        {children}
      </nav>
    </aside>
  );
}