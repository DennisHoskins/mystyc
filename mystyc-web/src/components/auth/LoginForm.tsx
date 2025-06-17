'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useInitialized, useUser, useSetUser, useBusy } from '@/components/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import FormLayout from '@/components/form/FormLayout';
import FormLink from '@/components/form/FormLink';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const user = useUser();
  const setUser = useSetUser();
  const initialized = useInitialized();
  const router = useTransitionRouter();
  const { isBusy, setBusy } = useBusy();
  const { signIn } = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // mount guard
  useEffect(() => {
    if (isReady) {
      return;
    }
    setIsReady(true);
  }, [isReady]);

  // Redirect when fully initialized and user exists
  useEffect(() => {
    if (initialized && user) {
      router.replace('/');
    }
  }, [initialized, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);


    console.log("--->LOGIN<----");

    try {
      const u = await signIn(email, password);
      if (!u) throw new Error('no user returned');

      setUser(u);
    } catch (err: any) {
      setError(
        err.code === 500
          ? 'Server error. Please try again.'
          : 'Login failed. Please try again.'
      );
      setBusy(false);
    }
  };

  // Prevent any render until after mount, and bail if not initialized or already logged in
  if (!isReady || !initialized || user) {
    return null;
  }

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
          loading={isBusy}
          loadingContent="Signing In..."
          className="w-full"
        >
          Sign In
        </Button>
        <p className="text-center text-sm mt-2 text-gray-600">
          <span className="block">
            <FormLink href="/password-reset">Forgot your password?</FormLink>
          </span>
          <span className="block mt-1">
            Don&apos;t have an account? <FormLink href="/register">Register</FormLink>
          </span>
        </p>
      </Form>
    </FormLayout>
  );
}
