'use client'

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

interface MystycErrorProps {
  title: string;
  error: string;
  onRetry?: () => void;
}

export default function MystycError({ 
  title, 
  error, 
  onRetry 
}: MystycErrorProps) {

  return (
    <div className="text-center py-8 h-full w-full max-w-xl flex flex-col justify-center">
      <div className="text-4xl mb-4">⚠️</div>
      <Heading level={3} className="mb-2 text-red-600">
        {title}
      </Heading>
      <Text variant="muted" className="mb-6">
        {error}
      </Text>
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Try Again
        </Button>
      )}
    </div>
  )
}
