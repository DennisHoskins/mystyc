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
    <>
      <AppLogo scale={1.2} subheading={subtitle} className='mt-6' />

      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}

      {children}
    </>
  );
}