'use client'

import Text from '@/components/ui/Text';

type FormSuccessProps = {
  message: string | null;
};

export default function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div className="rounded-md bg-green-50 p-4">
      <Text variant="small" color="text-green-700">
        {message}
      </Text>
    </div>
  );
}