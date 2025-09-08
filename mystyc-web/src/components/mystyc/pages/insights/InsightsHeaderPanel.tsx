import { KeySquare } from "lucide-react";

import { Horoscope } from "mystyc-common";
import Text from "@/components/ui/Text";
import InsightsStarsPanel from "./InsightsStarsPanel";
import Panel from "@/components/ui/Panel";

export default function InsightsDetailsPanel({ insights } : { insights: Horoscope }) {
  return (
    <div className='flex flex-col space-y-4'>
      <InsightsStarsPanel insights={insights} />
      <Text variant='muted' className="!text-gray-400 !mt-4">{insights.personalChart.summary?.description}</Text>
      <Panel>
        <div className="flex items-center">
          <Text variant='muted' className='!text-gray-300 flex items-center font-bold'>
            <KeySquare className="w-4 h-4 mr-2 text-white" />
            Key Insights
          </Text>
        </div>
        <Text variant='muted' className="!text-gray-400">{insights.personalChart.summary?.action}</Text>
      </Panel>
    </div>
  );
}