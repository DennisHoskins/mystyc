import AuthTransition from '@/components/ui/layout/transition/AuthTransition';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthTransition>
      <RegisterForm />
    </AuthTransition>
  );
}