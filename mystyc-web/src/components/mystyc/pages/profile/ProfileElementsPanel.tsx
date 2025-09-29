import { ElementComplete } from "mystyc-common";
import { getElementIcon } from "@/components/ui/icons/astrology/elements";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

const elementColors: Record<string, string> = {
  Air: "#9A9A9A",
  Water: "#00838F",
  Fire: "#E65100",
  Earth: "#1cab1a",
};

export default function ProfileElementsPanel({ elementData } : { elementData: ElementComplete[] | undefined }) {
  const uniqueElementData = elementData ? Array.from(new Map(elementData.map(element => [element?.element, element])).values()) : [];

  return (
    <Panel className="flex flex-col space-y-10">
      {uniqueElementData.map((element, i) => (
        <div key={i} className="flex flex-col space-y-2">
          <div className='flex items-center space-x-2'>
            {element &&
              <div className="p-1 rounded-md" style={{ backgroundColor: elementColors[element.element] }}>
                {getElementIcon(element?.element, 'w-4 h-4 text-white')}
              </div>
            }
            <Heading level={3}>{element?.element}</Heading>
          </div>
          <Text variant='small' color="text-gray-600">
            {element?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
          </Text>
          <Text variant='muted' loadingHeight={20}>{element?.description}</Text>
        </div>
      ))}
    </Panel>
  );
}