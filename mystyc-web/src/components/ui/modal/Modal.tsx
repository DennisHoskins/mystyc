'use client'

import { ReactNode } from 'react';

import styles from './Modal.module.css';
import { useAppStore } from '@/store/appStore';
import Overlay from '@/components/ui/overlay/Overlay';
import ModalTransition from '../transition/ModalTransition';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  doTransition?: boolean;
}

export default function Modal({ children, isOpen, onClose, doTransition = true }: ModalProps) {
  const { isModalShowing } = useAppStore();

  const handleOverlayClick = async (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      window.dispatchEvent(new CustomEvent('start-exit'));
      await new Promise<void>(resolve => {
      const handleExitComplete = () => {
        window.removeEventListener('exit-complete', handleExitComplete);
        resolve();
      };
      window.addEventListener('exit-complete', handleExitComplete);
    });
    onClose();
    }
  };

  if (!isModalShowing || !isOpen) {
    return null;
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalTransition doTransition={doTransition}>
        <div className={`w-full max-w-xl p-6 text-center space-y-6 pointer-events-auto ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </ModalTransition>        
    </Overlay>
  );
}