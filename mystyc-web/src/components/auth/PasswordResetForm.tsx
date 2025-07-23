'use client';

import { useState, useEffect } from 'react';

import { apiClient } from '@/api/apiClient';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { logger } from '@/util/logger';

import { useUser, useInitialized, useBusy } from '@/components/ui/layout/context/AppContext';
import Card from "@/components/ui/Card";
import Form from '@/components/ui/form/Form';
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function PasswordResetPage() {
  const router = useTransitionRouter();
  const user = useUser();
  const initialized = useInitialized();
  const { setBusy } = useBusy();

  const [isReady, setIsReady] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
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

  useEffect(() => {
    if (initialized && user) {
      router.replace('/');
    }
  }, [initialized, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(500);
    setIsWorking(true);

    try {
      await apiClient.auth.resetPassword(email);
      setMessage('Check your email for a password reset link.');
      setBusy(false);
    } catch (err: any) {
      logger.error('Password reset error:', err);

      switch (err.code) {
        case 500:
          setError('Server error. Please try again.');
          break;
        default:
          setError('Password reset failed. Please try again.');
      }

      setBusy(false);
      setIsWorking(false);
    }
  };

  // Prevent any render until after mount, and bail if not initialized or already logged in
  if (!isReady || !initialized || user) {
    return null;
  }

  return (
    <Card className='w-full md:max-w-lg text-center p-4 m-4'>
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
            loading={isWorking}
            loadingContent="Sending Reset Email..."
            className="w-full"
          >
            Send Reset Email
          </Button>

          <p className="text-center text-sm mt-2 text-gray-600">
            <span className="block">
              Remember your password? <Link href="/login">Sign In</Link>
            </span>
            <span className="block mt-1">
              Don&apos;t have an account? <Link href="/register">Register</Link>
            </span>
          </p>
        </Form>
      </FormLayout>
    </Card>
  );
}
