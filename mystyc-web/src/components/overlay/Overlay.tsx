'use client';

import { ReactNode } from 'react';
import styles from './Overlay.module.css';

interface OverlayProps {
  children?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Overlay({ children, onClick }: OverlayProps) {
  return (
    <div className={styles.overlay} onClick={onClick}>
      {children}
    </div>
  );
}