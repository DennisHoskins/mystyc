'use client';

import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/modal/Modal';
import RegisterForm from '@/components/app/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  return (
    <Modal isOpen={true} onClose={() => router.back()}>
      <RegisterForm />
    </Modal>
  )
}