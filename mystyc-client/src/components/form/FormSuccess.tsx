'use client';

type FormSuccessProps = {
  message: string | null;
};

export default function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
      {message}
    </div>
  );
}
