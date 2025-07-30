'use client'

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/util/logger';
import { useSetUser, useBusy } from '@/components/ui/layout/context/AppContext';
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function RegisterForm() {
  const { register } = useAuth();
  const setUser = useSetUser();
  const { setBusy } = useBusy();

  const [isWorking, setIsWorking] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(500);
    setIsWorking(true);

    try {
      const user = await register(email, password);
      if (!user) {
        throw new Error('Register failed: no user returned');
      }

      setUser(user);
    } catch (err: any) {
      logger.error('Registration error:', err);

      switch (err.code) {
        case 500:
          setError('Server error. Please try again.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }

      setBusy(false);
      setIsWorking(false);
    }
  };

  return (
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
          loading={isWorking}
          loadingContent="Creating Account..."
          className="w-full"
        >
          Create Account
        </Button>

        <p className="text-center text-sm mt-4 text-gray-600">
          <span className="block">
            Already have an account? <Link href="/login">Sign In</Link>
          </span>
          <span className="block mt-1">
            <Link href="/password-reset">Forgot your password?</Link>
          </span>
        </p>
      </Form>
    </FormLayout>
  );
}
