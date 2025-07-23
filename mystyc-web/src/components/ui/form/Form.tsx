import { FormHTMLAttributes } from 'react';
import clsx from 'clsx';

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: React.ReactNode;
};

export default function Form({
  children,
  className,
  ...props
}: FormProps) {
  return (
    <form
      className={clsx(
        'space-y-4',
        className
      )}
      {...props}
    >
      {children}
    </form>
  );
}