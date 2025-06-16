'use client';

import AppLogo from '@/components/AppLogo';
import FormError from '@/components/form/FormError';
import FormSuccess from '@/components/form/FormSuccess';

type FormLayoutProps = {
  subtitle?: string;
  error?: string | null;
  success?: string | null;
  children: React.ReactNode;
};

export default function FormLayout({
  subtitle,
  error,
  success,
  children,
}: FormLayoutProps) {
  return (
    <div className="w-full max-w-md text-center">
      <AppLogo scale={1.2} subheading={subtitle} />

      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}

      <div className="mt-8 space-y-6">
        {children}
      </div>
    </div>
  );
}