import { PlanetaryData, PlanetType } from "mystyc-common";
import Card from "@/components/ui/Card";
import { getPlanetIcon } from "@/components/ui/icons/astrology/planets";
import Heading from "@/components/ui/Heading";
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";
import Text from "@/components/ui/Text";
import LinearGauge from "../../ui/LinearGauge";

export default function InsightInteractionCard({ planet, cosmicChart, personalChart } : { 
  planet: PlanetType, 
  cosmicChart: PlanetaryData | null | undefined, 
  personalChart: PlanetaryData | null | undefined,
}) {
  return (
    <Card>
      <div className='flex items-center hover:!no-underline'>
        {getPlanetIcon(planet, "w-4 h-4 mr-2 text-white")}
        <Heading level={2} color='text-white'>{planet}: </Heading>
        <Heading level={2} color='text-white' className='ml-1'>{cosmicChart?.sign}</Heading>
        {cosmicChart && getZodiacIcon(cosmicChart?.sign, "w-5 h-5 ml-1 text-white !mt-1")}
        <Text variant='xs' color='text-gray-300' className='ml-1 !mt-2'>{cosmicChart?.degreesInSign ? cosmicChart?.degreesInSign + '°' : ''}</Text>
      </div>
      <div className='!-mt-2 max-w-md'>
        <LinearGauge label='' score={personalChart?.totalScore} />
      </div>
      <Text variant='muted' color='text-gray-400' className="!mt-2 min-h-20" loadingHeight={18}>{personalChart?.summary?.description}</Text>
    </Card>
  );
}