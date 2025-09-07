import Text from "@/components/ui/Text";
import { Horoscope } from "mystyc-common";
import InsightsStarsPanel from "./InsightsStarsPanel";

export default function InsightsDetailsPanel({ insights } : { insights: Horoscope }) {
  return (
    <div className='flex flex-col space-y-4'>
      <InsightsStarsPanel insights={insights} />
      <Text variant='muted' className="!text-gray-400 !mt-4">{insights.personalChart.summary?.description}</Text>
      <Text variant='muted' className="!text-gray-400 !mt-4">{insights.personalChart.summary?.action}</Text>
    </div>
  );
}