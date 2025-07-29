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
    <div className='flex flex-col w-full space-y-6'>
      <div className="text-gray-500 text-sm">
        {subtitle}
      </div>

      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}

      {children}
    </div>
  );
}