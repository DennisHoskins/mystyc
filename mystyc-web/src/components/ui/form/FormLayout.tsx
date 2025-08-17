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
    <div className='flex flex-col w-full space-y-4'>

      {title &&
        <div className="text-gray-300 text-md font-medium">
          {title}
        </div>
      }

      {subtitle &&
        <div className="text-gray-400 text-sm flex flex-col">
          {subtitle}
        </div>
      }

      {error && <FormError message={error} />}
      {success && <FormSuccess message={success} />}

      <span className={`${error || success ? "" : "!mt-10"}`}>
        {children}
      </span>        
    </div>
  );
}