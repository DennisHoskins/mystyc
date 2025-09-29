'use client'

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

interface AdminErrorProps {
  title: string;
  error: string;
  onRetry?: () => void;
}

export default function AdminErrorPage({ 
  title, 
  error, 
  onRetry 
}: AdminErrorProps) {

  return (
    <div className="w-full max-w-xl text-center py-8 h-full flex flex-col justify-center">
      <div className="text-4xl mb-4">⚠️</div>
      <Heading level={3} color='text-red-600' className="mb-2">
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
