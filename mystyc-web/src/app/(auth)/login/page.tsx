import AuthTransition from '@/components/ui/layout/transition/AuthTransition';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthTransition>
      <LoginForm />
    </AuthTransition>
  );
}