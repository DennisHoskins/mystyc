import { Dynamic } from "mystyc-common";
import { getDynamicIcon } from "@/components/ui/icons/astrology/dynamics";
import { formatStringForDisplay } from "@/util/util";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import LinearGauge from "@/components/mystyc/ui/LinearGauge";

export default function DynamicDetailsPanel({ dynamic, score } : { dynamic: Dynamic | null | undefined, score: number | null | undefined }) {
  return (
    <Panel className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        {dynamic && getDynamicIcon(dynamic.dynamic, 'w-6 h-6 text-white')}
        <Heading level={3}>{dynamic && `Dynamic: ${formatStringForDisplay(dynamic.dynamic)}`}</Heading>
      </div>
      <Text variant='small' color="text-gray-600">
        {dynamic?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <div className="!-mt-2 w-full max-w-md">
        <LinearGauge score={score} label="" />
      </div>
      <Text variant='muted' loadingHeight={15}>{dynamic?.description}</Text>
    </Panel>
  )
}