import FormError from './FormError';
import FormSuccess from './FormSuccess';

type FormLayoutProps = {
  title?: string | React.ReactNode | null;
  subtitle?: string | React.ReactNode | null;
  error?: string | null;
  success?: string | null;
  children: React.ReactNode;
};

export default function FormLayout({
  title,
  subtitle,
  error,
  success,
  children,
}: FormLayoutProps) {
  return (
    <div className='flex flex-col w-full space-y-6'>

      <div className="text-gray-500 text-base font-medium">
        <strong>{title}</strong>
      </div>

      <div className="text-gray-500 text-sm">
        {subtitle}
      </div>

      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}

      {children}
    </div>
  );
}