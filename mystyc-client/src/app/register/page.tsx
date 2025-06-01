'use client';

import { useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

import PageContainerAuth from '@/components/layout/PageContainerAuth';
import FormLayout from '@/components/layout/FormLayout';
import Form from '@/components/ui/form/Form';
import FormLink from '@/components/form/FormLink';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/form/TextInput';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const { shouldRender, shouldShowForm, startAuthProcess, endAuthProcess } = useAuthRedirect({
    redirectTo: '/',
    componentName: 'RegisterPage'
  });

  const { handleAuthError } = useErrorHandler({
    component: 'RegisterPage',
    showToast: false,
    onError: (processedError) => {
      setError(processedError.message);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);
    startAuthProcess();

    try {
      await register(email, password);
      // Don't set loading to false on success - keep button in loading state
    } catch (err: any) {
      handleAuthError(err, 'register');
      endAuthProcess(false);
      setLoading(false); // Only clear loading on error
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
        subtitle="Create an account to begin your journey..."
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
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            loading={loading}
            loadingContent="Creating Account..."
            className="w-full"
          >
            Create Account
          </Button>

          <p className="text-center text-sm mt-2 text-gray-600">
            <span className="block">
              Already have an account? <FormLink href="/login">Sign In</FormLink>
            </span>
            <span className="block mt-1">
              <FormLink href="/password-reset">Forgot your password?</FormLink>
            </span>
          </p>
        </Form>
      </FormLayout>
    </PageContainerAuth>
  );
}