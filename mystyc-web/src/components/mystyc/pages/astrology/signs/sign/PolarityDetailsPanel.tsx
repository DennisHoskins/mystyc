import { PolarityComplete } from "mystyc-common";
import { getPolarityIcon } from "@/components/ui/icons/astrology/polarities";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function PolarityDetailsPanel({ polarity } : { polarity: PolarityComplete | null | undefined }) {
  return (
    <Panel className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        {polarity && getPolarityIcon(polarity.polarity, 'w-8 h-8 mt-1 text-white text-bold')}
        <Heading level={3} className="min-w-40">{polarity && `Polarity: ${polarity?.polarity} / ${polarity?.alternativeName}`}</Heading>
      </div>
      <Text variant='small' className="!text-gray-600 min-w-50">
        {polarity?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted' loadingHeight={20}>{polarity?.description}</Text>
    </Panel>
  )
}