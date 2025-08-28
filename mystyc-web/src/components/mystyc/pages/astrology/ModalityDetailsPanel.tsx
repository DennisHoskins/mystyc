import { Modality } from "mystyc-common";
import { getModalityIcon } from "@/components/ui/icons/astrology/modalities";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function ModalityDetailsPanel({ modality } : { modality: Modality | null }) {
  if (!modality) {
    return null;
  }

  return (
    <Panel className="flex flex-col">
      <div className='flex items-center space-x-2'>
        {getModalityIcon(modality.modality, 'w-6 h-6 text-white')}
        <Heading level={3}>Modality: {modality.modality}</Heading>
      </div>
      <Text variant='muted'>{modality.description}</Text>
    </Panel>
  )
}