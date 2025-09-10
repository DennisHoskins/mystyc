import { PolarityComplete } from "mystyc-common";
import { getPolarityIcon } from "@/components/ui/icons/astrology/polarities";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function PolarityDetailsPanel({ polarity } : { polarity: PolarityComplete | null | undefined }) {
  if (!polarity) {
    return null;
  }

  return (
    <Panel className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        {getPolarityIcon(polarity.polarity, 'w-8 h-8 mt-1 text-white text-bold')}
        <Heading level={3}>Polarity: {polarity.polarity} / {polarity.alternativeName}</Heading>
      </div>
      <Text variant='small' className="!text-gray-600">
        {polarity.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted'>{polarity.description}</Text>
    </Panel>
  )
}