'use client';

import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useUser, useInitialized, useBusy } from '@/components/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import Form from '@/components/ui/form/Form';
import FormLayout from '@/components/form/FormLayout';
import FormLink from '@/components/form/FormLink';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function PasswordResetPage() {
  const router = useTransitionRouter();
  const user = useUser();
  const initialized = useInitialized();
  const { isBusy, setBusy } = useBusy();
  const { resetPassword } = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // mount guard
  useEffect(() => {
    if (isReady) {
      return;
    }
    setIsReady(true);
  }, [isReady]);

  // redirect when fully initialized and user exists
  useEffect(() => {
    if (initialized && user) {
      router.replace('/');
    }
  }, [initialized, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setBusy(true);

    try {
      await resetPassword(email);
      setMessage('Check your email for a password reset link.');
      setBusy(false);
    } catch (err: any) {
      console.error('Password reset error:', err);

      switch (err.code) {
        case 500:
          setError('Server error. Please try again.');
          break;
        default:
          setError('Password reset failed. Please try again.');
      }

      setBusy(false);
    }
  };

  // Prevent any render until after mount, and bail if not initialized or already logged in
  if (!isReady || !initialized || user) {
    return null;
  }

  return (
    <FormLayout
      subtitle="Reset your password"
      error={error}
      success={message}
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

        <Button
          type="submit"
          loading={isBusy}
          loadingContent="Sending Reset Email..."
          className="w-full"
        >
          Send Reset Email
        </Button>

        <p className="text-center text-sm mt-2 text-gray-600">
          <span className="block">
            Remember your password? <FormLink href="/login">Sign In</FormLink>
          </span>
          <span className="block mt-1">
            Don&apos;t have an account? <FormLink href="/register">Register</FormLink>
          </span>
        </p>
      </Form>
    </FormLayout>
  );
}
