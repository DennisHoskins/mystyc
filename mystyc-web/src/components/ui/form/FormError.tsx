import Text from '@/components/ui/Text';

type FormErrorProps = {
  message: string | null;
};

export default function FormError({ message }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className="rounded-md bg-red-50 mt-4 p-4 w-full">
      <Text variant="small" color="text-red-700">
        {message}
      </Text>
    </div>
  );
}