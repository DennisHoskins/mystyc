'use client'

import { usePathname } from 'next/navigation';

import { useTransitionRouter } from '@/hooks/useTransitionRouter'; 
import AuthLayout from '@/components/auth/AuthLayout';
import Modal from "@/components/ui/modal/Modal";

export default function Template({ children, modal } : { children: React.ReactNode, modal: React.ReactNode }) {
  const pathname = usePathname();
  const router = useTransitionRouter();
  const showModal = pathname !== '/' && pathname !== '/home';

  return (
    <>
      {children}
      {showModal &&
        <Modal key={pathname} isOpen={true} onClose={() => router.back() }>
          <AuthLayout>
            {modal}
          </AuthLayout>
        </Modal>
      }
    </>      
  );
}