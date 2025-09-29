
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
  const bgColor = element ? elementColors[element.element] : "#333333";

  return (
    <div className={`${className} space-y-2`}>
      <div className='flex items-center space-x-2'>
        {element &&
          <div className="p-1 rounded-md" style={{ backgroundColor: bgColor }}>
            {getElementIcon(element?.element, 'w-4 h-4 text-white')}
          </div>
        }
        <Heading level={3} className="min-w-20">{element?.element}</Heading>
      </div>
      <Text color='text-gray-500' variant='small' className="min-w-50">
        {element?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted' color='text-gray-400' className="min-w-full" loadingHeight={16}>{element?.description}</Text>
    </div>
  );
}
