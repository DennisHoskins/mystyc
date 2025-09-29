import { AstrologyCalculated } from "mystyc-common";
import Panel from "@/components/ui/Panel";
import StarChart from "./StarChart";
import Text from "@/components/ui/Text";

export default function StarChartPanel({ data, label, size = 400, className } : { data: AstrologyCalculated | null | undefined, label: string, size?: number, className?: string }) {
  const chartData = data ? {
    planets: {
      Sun: { sign: data.sun.sign, degrees: data.sun.degreesInSign ?? 0, absoluteDegrees: data.sun.absoluteDegrees ?? 0 },
      Moon: { sign: data.moon.sign, degrees: data.moon.degreesInSign ?? 0, absoluteDegrees: data.moon.absoluteDegrees ?? 0 },
      Rising: { sign: data.rising.sign, degrees: data.rising.degreesInSign ?? 0, absoluteDegrees: data.rising.absoluteDegrees ?? 0 },
      Venus: { sign: data.venus.sign, degrees: data.venus.degreesInSign ?? 0, absoluteDegrees: data.venus.absoluteDegrees ?? 0 },
      Mars: { sign: data.mars.sign, degrees: data.mars.degreesInSign ?? 0, absoluteDegrees: data.mars.absoluteDegrees ?? 0 },
    },
    size: size
  } : null;

  return (
    <Panel className={`items-center justify-center ${className}`}>
      {chartData
      ? (
        <>
          <Text variant='small' className='mt-4 mb-4 justify-self-start'>{label}</Text>
          <StarChart 
            data={chartData}
            showAspects={true}
            showHouses={false}
          />
        </>
      ) : (
        <div className="w-[80%] flex items-center justify-center opacity-10">
          <span className="block w-full animate-pulse rounded-full aspect-square border-2 border-gray-200"></span>
        </div>
      )}
    </Panel>
  );
}