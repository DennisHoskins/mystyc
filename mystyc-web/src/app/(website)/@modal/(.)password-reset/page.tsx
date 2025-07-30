'use client'

import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/modal/Modal';
import AppLogo from '@/components/ui/AppLogo';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

export default function PasswordResetPage() {
  const router = useRouter();

  const closeModal = () => {
    router.replace('/x')
    setTimeout(() => {
      router.replace('/')
    }, 100)  
  }

  return (
    <Modal isOpen={true} onClose={closeModal}>
      <AppLogo scale={1.2} className='mt-6' />
      <div className='min-h-64'>
        <PasswordResetForm />
      </div>
    </Modal>
  );
}