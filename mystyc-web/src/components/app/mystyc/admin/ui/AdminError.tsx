import Card from '@/components/ui/Card';
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
    <Card>
      <div className="text-center py-8">
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
    </Card>
  )
}
