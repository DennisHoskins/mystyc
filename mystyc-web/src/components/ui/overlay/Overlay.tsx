import { ReactNode } from 'react';

import styles from './Overlay.module.css';

interface OverlayProps {
  children?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export default function Overlay({ children, onClick, className }: OverlayProps) {
  return (
    <div className={`${styles.overlay} ${className}`} onClick={onClick}>
        {children}
    </div>
  );
}