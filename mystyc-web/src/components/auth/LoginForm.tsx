'use client';

import { useState, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { logger } from '@/util/logger';

import { useInitialized, useUser, useSetUser, useBusy } from '@/components/ui/layout/context/AppContext';
import Card from "@/components/ui/Card";
import FormLayout from '@/components/ui/form/FormLayout';
import Link from '@/components/ui/Link';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const user = useUser();
  const setUser = useSetUser();
  const initialized = useInitialized();
  const router = useTransitionRouter();
  const { setBusy } = useBusy();
  const { signIn } = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // mount guard
  useEffect(() => {
    if (!initialized) {
      return;
    }
    if (isReady) {
      return;
    }
    setIsReady(true);
    setIsLogin(user == null)
  }, [initialized, isReady, isLogin, user]);

  // Redirect when fully initialized and user exists
  useEffect(() => {
    if (initialized && user) {
      router.replace('/', !isLogin);
    }
  }, [initialized, user, isLogin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(500);
    setIsWorking(true);

    logger.log("LOGIN");

    try {
      const u = await signIn(email, password);
      if (!u) throw new Error('no user returned');

      setUser(u);
    } catch (err: any) {
      setError(
        err.code === 500
          ? 'Server error. Please try again.'
          : 'Login failed. Please try again.'
      );
      setBusy(false);
      setIsWorking(false);
    }
  };

  // Prevent any render until after mount, and bail if not initialized or already logged in
  if (!isReady || !initialized || user) {
    return null;
  }

  return (
    <Card className='w-full md:max-w-lg text-center p-4 m-4'>
      <FormLayout subtitle="Sign in to continue your journey..." error={error}>
        <Form onSubmit={handleSubmit}>
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextInput
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            loading={isWorking}
            loadingContent="Signing In..."
            className="w-full"
          >
            Sign In
          </Button>
          <p className="text-center text-sm mt-2 text-gray-600">
            <span className="block">
              <Link href="/password-reset">Forgot your password?</Link>
            </span>
            <span className="block mt-1">
              Don&apos;t have an account? <Link href="/register">Register</Link>
            </span>
          </p>
        </Form>
      </FormLayout>
    </Card>
  );
}
