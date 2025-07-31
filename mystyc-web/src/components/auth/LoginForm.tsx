'use client'

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useSetUser, useBusy } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const { signIn } = useAuth();
  const setUser = useSetUser();
  const { setBusy } = useBusy();
  const router = useTransitionRouter();

  const [isWorking, setIsWorking] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(500);
    setIsWorking(true);
    try {
      const user = await signIn(email, password);
      if (!user) throw new Error('no user returned');
      setUser(user);
    } catch (err: any) {
      setError(
        err.code === 500
          ? 'Server error. Please try again.'
          : 'Login failed. Please try again.'
      );
    } finally {
      setBusy(false);
      setIsWorking(false);
    }
  };

  return (
    <FormLayout subtitle="Sign in to continue your journey..." error={error}>
      <Form onSubmit={handleSubmit}>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <TextInput
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
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
        <p className="text-center text-sm mt-4 text-gray-600">
          <span className="block">
            <Link href="/password-reset" onClick={() => { router.replace("/password-reset") }}>Forgot your password?</Link>
          </span>
          <span className="block mt-1">
            Don&apos;t have an account? <Link href="/register" onClick={() => { router.replace("/register") }}>Register</Link>
          </span>
        </p>
      </Form>
    </FormLayout>
  );
}
