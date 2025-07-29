import AuthTransition from '@/components/ui/layout/transition/AuthTransition';
import LogoutForm from '@/components/auth/LogoutForm';

export default function LogoutPage() {
  return (
    <AuthTransition>
      <LogoutForm />
    </AuthTransition>
  );
}