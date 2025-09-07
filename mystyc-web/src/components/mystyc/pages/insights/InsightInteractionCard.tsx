import { PlanetaryData, PlanetType } from "mystyc-common";
import Card from "@/components/ui/Card";
import { getPlanetIcon } from "@/components/ui/icons/astrology/planets";
import Heading from "@/components/ui/Heading";
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";
import Text from "@/components/ui/Text";
import LinearGauge from "../../ui/LinearGauge";

export default function InsightInteractionCard({ planet, cosmicChart, personalChart } : { 
  planet: PlanetType, 
  cosmicChart: PlanetaryData, 
  personalChart: PlanetaryData,
}) {
  return (
    <Card className="!p-10">
      <div className='flex items-center hover:!no-underline'>
        {getPlanetIcon(planet, "w-4 h-4 mr-2 text-white")}
        <Heading level={2} className='!text-white'>{planet}: </Heading>
        <Heading level={2} className='!text-white ml-1'>{cosmicChart.sign}</Heading>
        {getZodiacIcon(cosmicChart.sign, "w-5 h-5 ml-1 text-white !mt-1")}
        <Text variant='xs' className='!text-gray-300 ml-1 !mt-2'>{cosmicChart.degreesInSign}°</Text>
      </div>
      <div className='!mt-2 max-w-md'>
        <LinearGauge label='' score={personalChart.totalScore} />
      </div>
      <Text variant='muted' className="!text-gray-400 !mt-2 !mb-4">{personalChart.summary?.description}</Text>
    </Card>
  );
}