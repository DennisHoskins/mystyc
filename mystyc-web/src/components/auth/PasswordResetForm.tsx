'use client'

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import Form from '@/components/ui/form/Form';
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function PasswordResetPage() {
  const { resetPassword } = useAuth();
  const { setBusy } = useBusy();

  const [isWorking, setIsWorking] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setBusy(500);
    setIsWorking(true);

    try {
      await resetPassword(email);
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

  return (
    <FormLayout
      error={error}
      success={message}
    >
      <Form onSubmit={handleSubmit}>
        <div className="text-gray-500 text-sm mb-2 -mt-4">Forgot your password? Don&apos;t worry. These things happen.</div>
        <div className="text-gray-500 text-sm mb-11">Enter your email address we will send you a link to set a new one</div>
        
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

        <p className="text-center text-sm mt-4 text-gray-600">
          <span className="block">
            Remember your password? <Link href="/login">Sign In</Link>
          </span>
          <span className="block mt-1">
            Don&apos;t have an account? <Link href="/register">Register</Link>
          </span>
        </p>
      </Form>
    </FormLayout>
  );
}
