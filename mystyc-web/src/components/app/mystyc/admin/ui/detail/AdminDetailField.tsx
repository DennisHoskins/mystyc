'use client';

import Text from '@/components/ui/Text';

interface AdminDetailFieldProps {
  label: string;
  value?: string | null;
}

export default function AdminDetailField({ label, value }: AdminDetailFieldProps) {
  return (
    <div>
      <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide">
        {label}
      </Text>
      <Text>{value || ''}</Text>
    </div>
  );
}