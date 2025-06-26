'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function WelcomeHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <>
      <Heading level={2}>{title}</Heading>
      {subtitle && <Text className="mt-2">{subtitle}</Text>}
    </>
  );
}