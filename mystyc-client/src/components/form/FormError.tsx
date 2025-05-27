'use client';

type FormErrorProps = {
  message: string | null;
};

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
      {message}
    </div>
  );
}
