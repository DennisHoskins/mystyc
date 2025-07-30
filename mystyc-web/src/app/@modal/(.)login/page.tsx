'use client'

import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/modal/Modal';
import AppLogo from '@/components/ui/AppLogo';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
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
        <LoginForm />
      </div>
    </Modal>
  );
}