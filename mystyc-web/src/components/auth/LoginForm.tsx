'use client'

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useSetUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import AuthLayout from '@/components/auth/AuthLayout';
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const { signIn } = useAuth();
  const setUser = useSetUser();
  const router = useTransitionRouter();

  const [isWorking, setIsWorking] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsWorking(true);
    try {
      const user = await signIn(email, password);
      if (!user) throw new Error('no user returned');
      setUser(user);
      router.replace("/home");
    } catch (err: any) {
      setError(
        err.code === 500
          ? 'Server error. Please try again.'
          : 'Login failed. Please try again.'
      );
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <AuthLayout isWorking={isWorking} >
      <FormLayout 
        title="Sign in to continue your journey..." 
        error={error}
      >
        <Form onSubmit={handleSubmit}>
          <TextInput
            id="email"
            name="email"
            type="email"
            label='Email Address'
            disabled={isWorking}
            autoComplete="email"
            animate={false}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <TextInput
            id="password"
            name="password"
            type="password"
            label="Password"
            disabled={isWorking}
            autoComplete="current-password"
            animate={false}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            loading={isWorking}
            loadingContent="Signing In..."
            className="w-full"
          >
            Sign In
          </Button>
          <p className="text-center text-sm mt-4 text-gray-400">
            <span className="block">
              <Link href="/password-reset" onClick={() => { router.replace("/password-reset", false)}}><strong>Forgot your password?</strong></Link>
            </span>
            <span className="block mt-1">
              Don&apos;t have an account? <Link href="/register" onClick={() => {router.replace("/register", false)}}><strong>Register</strong></Link>
            </span>
          </p>
        </Form>
      </FormLayout>
    </AuthLayout>
  );
}
