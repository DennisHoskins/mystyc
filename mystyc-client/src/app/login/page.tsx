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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  
  const { shouldRender, shouldShowForm, startAuthProcess, endAuthProcess } = useAuthRedirect({
    redirectTo: '/',
    componentName: 'LoginPage'
  });

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
    setLoading(true);
    startAuthProcess();

    try {
      await signIn(email, password);
      // Don't set loading to false on success - keep button in loading state
    } catch (err: any) {
      handleAuthError(err, 'login');
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
    <PageContainer>
      <FormLayout
        subtitle="Sign in to continue your journey..."
        error={error}
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
            loading={loading}
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
              Don't have an account? <FormLink href="/register">Register</FormLink>
            </span>
          </p>
        </form>
      </FormLayout>
    </PageContainer>
  );
}