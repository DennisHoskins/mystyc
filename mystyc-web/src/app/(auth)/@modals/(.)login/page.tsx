'use client';

import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/modal/Modal';
import LoginForm from '@/components/app/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  return (
    <Modal isOpen={true} onClose={() => router.back()}>
      <LoginForm />
    </Modal>
  )
}