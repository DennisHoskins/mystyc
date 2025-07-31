'use client'

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

import { useAppStore } from '@/store/appStore';
import { useTransitionRouter } from '@/hooks/useTransitionRouter'; 
import AuthLayout from '@/components/auth/AuthLayout';
import Modal from "@/components/ui/modal/Modal";

export default function Template({ children, modal } : { children: React.ReactNode, modal: React.ReactNode }) {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const { setModalShowing, isModalShowing } = useAppStore();
  const [doTransition, setDoTransition] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const showModal = pathname !== '/' && pathname !== '/home';
  const prevModalShowingRef = useRef(isModalShowing);

  useEffect(() => {
    if (!showModal) {
      setHasShown(true);
      setModalShowing(false);
      return;
    }
    if (hasShown) {
      setDoTransition(true);
      setHasShown(false);
    } else {
      setDoTransition(!isModalShowing);
    }
    setModalShowing(true);
  }, [showModal, hasShown, isModalShowing, setModalShowing]);  

  useEffect(() => {
    if (isModalShowing == prevModalShowingRef.current) return;
    prevModalShowingRef.current = isModalShowing;    
  }, [isModalShowing]);  

  const handleCloseModal = () => {
    setModalShowing(false);
    setHasShown(false); // Reset for next time
    prevModalShowingRef.current = false;    
    setDoTransition(true);
    router.back();
  }

  return (
    <>
      {children}
      {showModal &&
        <Modal isOpen={true} doTransition={doTransition} onClose={handleCloseModal}>
          <AuthLayout>
            {modal}
          </AuthLayout>
        </Modal>
      }
    </>      
  );
}