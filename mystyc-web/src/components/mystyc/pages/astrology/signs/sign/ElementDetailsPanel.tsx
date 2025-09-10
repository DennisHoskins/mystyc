
import { ElementComplete } from "mystyc-common";
import { getElementIcon } from "@/components/ui/icons/astrology/elements";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

const elementColors: Record<string, string> = {
  Air: "#9A9A9A",
  Water: "#00838F",
  Fire: "#E65100",
  Earth: "#1cab1a",
};

export default function ElementDetailsPanel({ element, className } : { element: ElementComplete | null | undefined, className?: string }) {
  if (!element) {
    return null;
  }

  const bgColor = elementColors[element.element] || "#333333";

  return (
    <div className={`p-4 ${className} space-y-2`}>
      <div className='flex items-center space-x-2'>
        <div className="p-1 rounded-md" style={{ backgroundColor: bgColor }}>
          {getElementIcon(element.element, 'w-4 h-4 text-white')}
        </div>
        <Heading level={3}>{element.element}</Heading>
      </div>
      <Text variant='small' className="!text-gray-500">
        {element.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted' className="!text-gray-400">{element.description}</Text>
    </div>
  );
}
