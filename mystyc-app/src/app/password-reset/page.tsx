'use client';

import { useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

import PageContainerAuth from '@/components/layout/PageContainerAuth';
import Form from '@/components/ui/form/Form';
import FormLayout from '@/components/layout/FormLayout';
import FormLink from '@/components/form/FormLink';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const { shouldRender, shouldShowForm } = useAuthRedirect({
    redirectTo: '/',
    componentName: 'PasswordResetPage'
  });

  const { handleAuthError } = useErrorHandler({
    component: 'PasswordResetPage',
    showToast: false,
    onError: (processedError) => {
      setError(processedError.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Check your email for a password reset link.');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) {
    return null;
  }

  if (!shouldShowForm) {
    return null;
  }

  return (
    <PageContainerAuth>
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
              Don&apos;t have an account? <FormLink href="/register">Register</FormLink>
            </span>
          </p>
        </Form>
      </FormLayout>
    </PageContainerAuth>
  );
}