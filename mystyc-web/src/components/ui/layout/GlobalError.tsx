import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function Error() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-md text-center mx-4 px-6 border rounded-md p-6 shadow-sm bg-white">
        <div className="text-6xl mb-6">💥</div>
        
        <Heading level={2} className="mb-4">
          Something Went Wrong
        </Heading>
        
        <Text variant="muted" className="mb-8">
          An unexpected error occurred. You can try reloading the page or dismiss this message.
        </Text>

        <div className="space-y-4">
          <Button onClick={handleReload} className="w-full">
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}