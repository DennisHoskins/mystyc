'use client'

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { logger } from '@/util/logger';
import AuthLayout from '@/components/auth/AuthLayout';
import Form from '@/components/ui/form/Form';
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function PasswordResetPage() {
  const { resetPassword } = useAuth();
  const router = useTransitionRouter();

  const [isWorking, setIsWorking] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsWorking(true);

    try {
      await resetPassword(email);
      setMessage('Check your email for a password reset link.');
    } catch (err: any) {
      logger.error('Password reset error:', err);

      switch (err.code) {
        case 500:
          setError('Server error. Please try again.');
          break;
        default:
          setError('Password reset failed. Please try again.');
      }
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <AuthLayout isWorking={isWorking}>
      <FormLayout
        title="Forgot your password?"
        subtitle={
          <>
            Don&apos;t worry. These things happen.
            <br />
            Enter your email address we will send you a link to set a new one...
          </>
        }
        error={error}
        success={message}
      >
        <Form onSubmit={handleSubmit} className='!mt-4'>
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

          <Button
            type="submit"
            loading={isWorking}
            disabled={isWorking}
            loadingContent="Sending Reset Email..."
            className="w-full"
          >
            Send Reset Email
          </Button>

          <p className="text-center text-sm mt-4 text-gray-400">
            <span className="block">
              Remember your password? <Link href="/login" onClick={() => router.replace("/login", false)}><strong>Sign In</strong></Link>
            </span>
            <span className="block mt-1">
              Don&apos;t have an account? <Link href="/register" onClick={() => router.replace("/register", false)}><strong>Register</strong></Link>
            </span>
          </p>
        </Form>
      </FormLayout>
    </AuthLayout>
  );
}
