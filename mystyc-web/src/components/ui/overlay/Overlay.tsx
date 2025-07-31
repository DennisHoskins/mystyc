import { ReactNode } from 'react';

import styles from './Overlay.module.css';
import OverlayTransition from '@/components/ui/transition/OverlayTransition';

interface OverlayProps {
  children?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export default function Overlay({ children, onClick }: OverlayProps) {
  return (
    <OverlayTransition>
      <div className={styles.overlay} onClick={onClick}>
        {children}
      </div>
    </OverlayTransition>      
  );
}