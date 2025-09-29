import { KeySquare } from "lucide-react";

import { Horoscope } from "mystyc-common";
import Text from "@/components/ui/Text";
import InsightsStarsPanel from "./InsightsStarsPanel";
import Panel from "@/components/ui/Panel";

export default function InsightsDetailsPanel({ insights } : { insights: Horoscope | null }) {
  return (
    <div className='flex flex-col space-y-4'>
      <InsightsStarsPanel insights={insights} />

      <div className="flex space-x-1 items-center !mt-4">
        <Text variant='small' className="!text-gray-500">Moon Phase:</Text>
        <Text variant='small' className="!text-gray-500 min-w-20">{insights?.astronomicalEvents.moonPhase.phase}</Text>
      </div>        

      <Text variant='muted' color='text-gray-400' className="!mt-4" loadingHeight={20}>{insights?.personalChart.summary?.description}</Text>

      {insights?.astronomicalEvents.todaysEvents.length != 0 &&
        <ul>
          {insights?.astronomicalEvents.todaysEvents.map((event, i) => (
            <li key={i}>
              <Text variant='small' className="!text-gray-500 !mt-4">{event.name}</Text>
            </li>    
          ))}
        </ul>
      }
      
      <Panel className="hidden md:block">
        <div className="flex items-center">
          <Text variant='muted' className='!text-gray-300 flex items-center font-bold'>
            <KeySquare className="w-4 h-4 mr-2 text-white" />
            Key Insights
          </Text>
        </div>
        <Text variant='muted' className="!text-gray-400" loadingHeight={15}>{insights?.personalChart.summary?.action}</Text>
      </Panel>
    </div>
  );
}