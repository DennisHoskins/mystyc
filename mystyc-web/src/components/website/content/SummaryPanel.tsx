import Heading from "@/components/ui/Heading";
import Panel from "@/components/ui/Panel";
import Text from "@/components/ui/Text";

export default function SummaryPanel({ icon, label, text } : { icon: React.ReactNode, label: string, text: string  }) {
  return (
    <Panel className="py-4 md:!py-10 lg:!py-20 items-center justify-center flex-col text-center">
      {icon}
      <Heading level={6} className="!mt-4">{label}</Heading>
      <Text variant="small" color='text-gray-500' className="!mt-2">{text}</Text>
    </Panel>
  );
}