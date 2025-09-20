'use client'

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useSetUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { logger } from '@/util/logger';
import AuthLayout from '@/components/auth/AuthLayout';
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function RegisterForm() {
  const { register } = useAuth();
  const setUser = useSetUser();
  const router = useTransitionRouter();

  const [isWorking, setIsWorking] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsWorking(true);
    try {
      const user = await register(email, password);
      if (!user) throw new Error('Register failed: no user returned');
      setUser(user);
      router.replace("/home");
    } catch (err: any) {
      logger.error('Registration error:', err);
      switch (err.code) {
        case 500:
          setError('Server error. Please try again.');
          break;
        default:
          setError('Registration failed. Please try again.');
      }
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <AuthLayout isWorking={isWorking}>
      <FormLayout
        title="Create an account to begin your journey..."
        error={error}
      >
        <Form onSubmit={handleSubmit}>
          <TextInput
            id="email"
            name="email"
            type="email"
            label="Email address"
            disabled={isWorking}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextInput
            id="password"
            name="password"
            type="password"
            label="Password"
            disabled={isWorking}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            loading={isWorking}
            disabled={isWorking}
            loadingContent="Creating Account..."
            className="w-full"
          >
            Create Account
          </Button>

          <p className="text-center text-sm mt-4 text-gray-400">
            <span className="block">
              Already have an account? <Link href="/login" onClick={() => router.replace("/login", false)}><strong>Sign In</strong></Link>
            </span>
            <span className="block mt-1">
              <Link href="/password-reset" onClick={() => router.replace("/password-reset", false)}><strong>Forgot your password?</strong></Link>
            </span>
          </p>
        </Form>
      </FormLayout>
    </AuthLayout>      
  );
}
