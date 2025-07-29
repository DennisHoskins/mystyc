import AuthTransition from '@/components/ui/layout/transition/AuthTransition';
import PasswordResetForm from '@/components/auth/PasswordResetForm';

export default function PasswordResetPage() {
  return (
    <AuthTransition>
      <PasswordResetForm />
    </AuthTransition>
  );
}