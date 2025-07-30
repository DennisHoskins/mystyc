import { ReactNode } from 'react';

import styles from './Modal.module.css';

import Overlay from '@/components/ui/overlay/Overlay';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
}

export default function Modal({ children, isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <Overlay onClick={handleOverlayClick}>
      <div className={`w-full max-w-xl p-6 text-center space-y-6 ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </Overlay>
  );
}