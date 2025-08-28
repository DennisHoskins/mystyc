import { EnergyType } from "mystyc-common";
import { formatStringForDisplay } from "@/util/util";
import { getCategoryIcon } from "@/components/ui/icons/astrology/categories";
import Heading from "@/components/ui/Heading";
import Panel from "@/components/ui/Panel";
import Text from "@/components/ui/Text";

export default function EnergyTypePanel({ energyType } : { energyType: EnergyType | null }) {
  if (!energyType) {
    return null;
  }

  return (
    <Panel className="!mt-4">
      <div className='flex items-center space-x-2'>
        {getCategoryIcon(energyType.category, 'w-3 h-3 text-gray-500')}
        <Heading level={4} className="!text-gray-500">{formatStringForDisplay(energyType.category)} Energy</Heading>
      </div>
      <div className='flex items-center space-x-2'>
        <Heading level={3}>{formatStringForDisplay(energyType.energyType)}</Heading>
      </div>
      <Text variant='muted'>{energyType.description}</Text>
    </Panel>
  );
}