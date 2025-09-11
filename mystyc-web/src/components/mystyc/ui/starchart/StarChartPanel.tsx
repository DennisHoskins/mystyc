import { AstrologyCalculated } from "mystyc-common";
import Panel from "@/components/ui/Panel";
import StarChart from "./StarChart";
import Text from "@/components/ui/Text";

export default function StarChartPanel({ data, label, size = 400, className } : { data: AstrologyCalculated, label: string, size?: number, className?: string }) {
  const sampleData = {
    planets: {
      Sun: { sign: data.sun.sign!, degrees: data.sun.degreesInSign!, absoluteDegrees: data.sun.absoluteDegrees! },
      Moon: { sign: data.moon.sign!, degrees: data.moon.degreesInSign!, absoluteDegrees: data.moon.absoluteDegrees! },
      Rising: { sign: data.rising.sign!, degrees: data.rising.degreesInSign!, absoluteDegrees: data.rising.absoluteDegrees! },
      Venus: { sign: data.venus.sign!, degrees: data.venus.degreesInSign!, absoluteDegrees: data.venus.absoluteDegrees! },
      Mars: { sign: data.mars.sign!, degrees: data.mars.degreesInSign!, absoluteDegrees: data.mars.absoluteDegrees! },
    },
    size: size
  };

  return (
    <Panel className={`items-center justify-center ${className}`}>
      <Text variant='small' className='mt-2'>{label}</Text>
      <StarChart 
        data={sampleData}
        showAspects={true}
        showHouses={false}
      />
    </Panel>
  );
}