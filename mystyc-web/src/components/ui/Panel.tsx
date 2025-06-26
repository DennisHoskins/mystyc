import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

interface PanelProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export default function Panel({ title, description, icon }: PanelProps) {
  return (
    <div className="border rounded-lg p-6 shadow-sm">
      {icon && <div className="mb-4">{icon}</div>}
      <Heading level={3} className="mb-2">
        {title}
      </Heading>
      <Text>
        {description}
      </Text>
    </div>
  );
}