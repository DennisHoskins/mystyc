import { ModalityComplete } from "mystyc-common";
import { getModalityIcon } from "@/components/ui/icons/astrology/modalities";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function ModalityDetailsPanel({ modality } : { modality: ModalityComplete | null | undefined }) {
  if (!modality) {
    return null;
  }

  return (
    <Panel className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        {getModalityIcon(modality.modality, 'w-6 h-6 text-white')}
        <Heading level={3}>Modality: {modality.modality}</Heading>
      </div>
      <Text variant='small' className="!text-gray-600">
        {modality.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted'>{modality.description}</Text>
    </Panel>
  )
}