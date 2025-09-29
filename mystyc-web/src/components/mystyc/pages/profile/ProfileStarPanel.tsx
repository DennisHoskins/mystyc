import { PlanetaryData, PlanetType } from "mystyc-common";
import { getPlanetIcon } from "@/components/ui/icons/astrology/planets";
import Panel from "@/components/ui/Panel";
import Text from "@/components/ui/Text";

export default function ProfileStarPanel({ planet, iconClass, data } : { planet: PlanetType, iconClass?: string, data: PlanetaryData | undefined }) {
  
  return (
    <Panel padding={4} className="items-center justify-center">
      <div className="h-6 md:h-12 mt-1 flex items-center">
        {planet && getPlanetIcon(planet, `h-6 w-6 md:h-10 md:w-10 text-white ${iconClass}`)}
      </div>
      <Text variant="xs" color='text-white' className="font-bold min-w-10 text-center">{data?.sign}</Text>
      <Text variant="xs" color='text-gray-300' className="text-[8px] !mt-0">{data && data?.degreesInSign + '°'}</Text>
    </Panel>
  );
}