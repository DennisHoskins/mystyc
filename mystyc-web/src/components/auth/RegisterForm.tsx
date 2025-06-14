'use client';

import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useBusy } from '@/components/context/BusyContext';
import { useApp } from '@/components/context/AppContext';

import FormLayout from '@/components/layout/FormLayout';
import FormLink from '@/components/form/FormLink';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function RegisterForm() {
  const router = useCustomRouter();
  const { isBusy, setBusy } = useBusy();
  const { register } = useAuth();
  const { app, setUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if ((app && app.user) && !isBusy) router.replace('/');
  }, [app, isBusy, router]);  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setBusy(true);

    try {
      const user = await register(email, password);
      if (!user) {
        throw new Error('Register failed: no user returned');
      }

      setUser(user);

      router.push("/");
    } catch (err: any) {
      console.error('Registration error:', err);
      
      switch (err.code) {
        case 500:
          setError('Server error. Please try again.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }

      setBusy(false);
    }
  };

  return (
    <>
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
            loading={isBusy}
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
    </>
  );
}