'use client';

import AppLogo from '@/components/ui/AppLogo';
import FormError from './FormError';
import FormSuccess from './FormSuccess';

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
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-md text-center px-4 -mt-20">
        <AppLogo scale={1.2} subheading={subtitle} />

        {error && <FormError message={error} />}
        {success && <FormSuccess message={success} />}

        <div className="mt-8 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}