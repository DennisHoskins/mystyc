'use client'

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { useAppStore } from '@/store/appStore';
import { useTransitionRouter } from '@/hooks/useTransitionRouter'; 
import Modal from "@/components/ui/modal/Modal";

export default function Layout({ children, modal } : { children: React.ReactNode, modal: React.ReactNode }) {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const { setModalShowing, isModalShowing } = useAppStore();
  
  const showModal = pathname !== '/' && pathname !== '/home';
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (pathname == '/privacy' || pathname == '/terms') {
      setModalShowing(false);
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (showModal !== isModalShowing) {
        setModalShowing(showModal);
      }
      return;
    }
    
    // On subsequent renders (route changes), keep modal open if we're staying in modal routes
    if (showModal && !isModalShowing) {
      setModalShowing(true);
    } else if (!showModal && isModalShowing) {
      setModalShowing(false);
    }
  }, [showModal, isModalShowing, setModalShowing, pathname]);

  const handleCloseModal = () => {
    setModalShowing(false);
    router.back();
  }

  return (
    <>
      {children}
      {showModal && (
        <Modal 
          isOpen={isModalShowing} 
          doTransition={!isFirstRender.current} 
          onClose={handleCloseModal}
        >
          {modal}
        </Modal>
      )}
    </>      
  );
}