'use client';

import { useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

import Button from '@/components/ui/Button';
import TextInput from '@/components/form/TextInput';
import FormLink from '@/components/form/FormLink';
import PageContainer from '@/components/layout/PageContainer';
import FormLayout from '@/components/layout/FormLayout';
import Text from '@/components/ui/Text';

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
      handleAuthError(err, 'password-reset');
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

          <Text variant="small" className="text-center mt-2">
            <Text as="span" className="block">
              Remember your password? <FormLink href="/login">Sign In</FormLink>
            </Text>
            <Text as="span" className="block mt-1">
              Don&apos;t have an account? <FormLink href="/register">Register</FormLink>
            </Text>
          </Text>
        </form>
      </FormLayout>
    </PageContainer>
  );
}