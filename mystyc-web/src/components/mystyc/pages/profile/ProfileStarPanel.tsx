import { PlanetaryData, PlanetType } from "mystyc-common";
import { getPlanetIcon } from "@/components/ui/icons/astrology/planets";
import Panel from "@/components/ui/Panel";
import Text from "@/components/ui/Text";

export default function ProfileStarPanel({ planet, iconClass, data } : { planet: PlanetType, iconClass?: string, data: PlanetaryData }) {
  
  return (
    <Panel className="!p-4 items-center justify-center">
      <div className="h-6 md:h-12 mt-1 flex items-center">
        {getPlanetIcon(planet, `h-6 w-6 md:h-10 md:w-10 text-white ${iconClass}`)}
      </div>
      <Text variant="xs" className="text-white font-bold">{data.sign}</Text>
      <Text variant="xs" className="text-gray-300 !text-[8px] !mt-0">{data.degreesInSign}°</Text>
    </Panel>
  );
}