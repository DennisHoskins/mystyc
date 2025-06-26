'use client';

import { ReactNode } from 'react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  children: ReactNode;
  isOpen?: boolean;
  isCollapsed?: boolean;
  className?: string;
}

export default function Sidebar({ 
  children, 
  isOpen = true, 
  isCollapsed = false, 
  className = '' 
}: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isOpen ? styles.open : styles.closed} ${className}`}>
      <nav className={styles.nav}>
        {children}
      </nav>
    </aside>
  );
}