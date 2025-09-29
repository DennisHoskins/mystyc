'use client'

import { ReactNode } from 'react';
import { X } from 'lucide-react';

import styles from './Modal.module.css';
import { useAppStore } from '@/store/appStore';
import Overlay from '@/components/ui/overlay/Overlay';
import ModalTransition from '../transition/ModalTransition';
import Button from '@/components/ui/Button';

interface ModalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  doTransition?: boolean;
}

export default function Modal({ children, isOpen, onClose, doTransition = true }: ModalProps) {
  const { isModalShowing } = useAppStore();

  const handleOverlayClick = async(e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) closeModal();
  };

  const closeModal = async() => {
    if (!onClose) return;
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

  if (!isModalShowing || !isOpen) {
    return null;
  }

  return (
    <Overlay onClick={handleOverlayClick}>
      <ModalTransition doTransition={doTransition}>
        <div className={`h-full md:h-auto justify-center flex flex-col w-full max-w-xl bg-[var(--color-main)] border border-[var(--color-border)] p-6 text-center space-y-6 pointer-events-auto ${styles.modal}`} onClick={(e) => e.stopPropagation()}>
          <div className='flex justify-end'>
            <Button onClick={closeModal}  variant='ghost' className='!text-gray-700'><X /></Button>
          </div>
          {children}
        </div>
      </ModalTransition>        
    </Overlay>
  );
}