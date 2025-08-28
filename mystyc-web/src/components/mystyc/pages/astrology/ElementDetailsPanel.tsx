import { Element } from "mystyc-common";
import { getElementIcon } from "@/components/ui/icons/astrology/elements";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function ElementDetailsPanel({ element } : { element: Element | null }) {
  if (!element) {
    return null;
  }

  return (
    <Panel className="flex flex-col">
      <div className='flex items-center space-x-2'>
        {getElementIcon(element.element, 'w-6 h-6 text-white')}
        <Heading level={3}>Element: {element.element}</Heading>
      </div>
      <Text variant='muted'>{element.description}</Text>
    </Panel>
  );
}