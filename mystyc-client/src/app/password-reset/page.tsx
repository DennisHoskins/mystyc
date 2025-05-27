'use client';

import { useState, useEffect } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useBusy } from '@/components/context/BusyContext';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useErrorHandler } from '@/hooks/useErrorHandler';

import Button from '@/components/ui/Button';
import TextInput from '@/components/form/TextInput';
import FormLink from '@/components/form/FormLink';
import PageContainer from '@/components/layout/PageContainer';
import FormLayout from '@/components/layout/FormLayout';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useCustomRouter();
  const { resetPassword, user } = useAuth();
  const { setBusy } = useBusy();

  // Use centralized error handling
  const { handleAuthError } = useErrorHandler({
    component: 'PasswordResetPage',
    showToast: false, // We show errors inline for forms
    onError: (processedError) => {
      setError(processedError.message);
    }
  });

  useEffect(() => {
    setBusy(false);
  }, []);  
  
  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(''); // Clear previous errors
    setMessage(''); // Clear previous success messages
    setLoading(true);
    setBusy(true);

    try {
      await resetPassword(email);
      setMessage('Check your email for a password reset link.');
    } catch (err: any) {
      // Use centralized error handling - one line!
      handleAuthError(err, 'password-reset');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <FormLayout
        subtitle="Reset your password"
        error={error}
        success={message}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            loading={loading}
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
              Don't have an account? <FormLink href="/register">Register</FormLink>
            </span>
          </p>
        </form>
      </FormLayout>
    </PageContainer>
  );
}