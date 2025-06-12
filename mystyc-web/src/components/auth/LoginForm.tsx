'use client';

import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useBusy } from '@/components/context/BusyContext';
import { useApp } from '@/components/context/AppContext';

import FormLayout from '@/components/layout/FormLayout';
import FormLink from '@/components/form/FormLink';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useCustomRouter();
  const { isBusy, setBusy } = useBusy();
  const { signIn } = useAuth();
  const { app, setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if ((app && app.user) && !isBusy) router.replace('/');
  }, [app, isBusy, router]);

  const { handleAuthError } = useErrorHandler({
    component: 'LoginPage',
    showToast: false,
    onError: (processedError) => {
      setError(processedError.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setBusy(true);

    try {
      const user = await signIn(email, password);
      if (!user) {
        throw new Error('Login failed: no user returned');
      }

      setUser(user);

      router.push("/");
    } catch (err: any) {
      handleAuthError(err);
      setBusy(false);
    }
  };

  return (
    <>
      <FormLayout
        subtitle="Sign in to continue your journey..."
        error={error}
      >
        <Form onSubmit={handleSubmit}>
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
    </>
  );
}