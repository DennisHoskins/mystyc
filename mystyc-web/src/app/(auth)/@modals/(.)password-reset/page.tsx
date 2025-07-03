'use client';

import { useRouter } from 'next/navigation';

import Modal from '@/components/ui/modal/Modal';
import PasswordResetForm from '@/components/app/auth/PasswordResetForm';

export default function PasswordResetPage() {
  const router = useRouter();

  return (
    <Modal isOpen={true} onClose={() => router.back()}>
      <PasswordResetForm />
    </Modal>
  )
}