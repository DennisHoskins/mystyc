'use client';

import { ReactNode } from 'react';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import styles from './Sidebar.module.css';

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  isCollapsed?: boolean;
}

export default function SidebarItem({ 
  icon, 
  label, 
  href, 
  onClick, 
  isActive = false, 
  isCollapsed = false 
}: SidebarItemProps) {
  const router = useTransitionRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (href) {
      router.push(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`${styles.sidebarItem} ${isActive ? styles.active : ''} ${isCollapsed ? styles.collapsed : ''}`}
      title={isCollapsed ? label : undefined}
    >
      <span className={`${styles.icon}`}>{icon}</span>
      <span className={`${styles.label} ${isCollapsed ? styles.collapsed : ''}`}>{label}</span>
    </a>
  );
}