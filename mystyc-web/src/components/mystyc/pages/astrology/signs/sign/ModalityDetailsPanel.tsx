import { ModalityComplete } from "mystyc-common";
import { getModalityIcon } from "@/components/ui/icons/astrology/modalities";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function ModalityDetailsPanel({ modality } : { modality: ModalityComplete | null | undefined }) {
  return (
    <Panel className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        {modality && getModalityIcon(modality.modality, 'w-6 h-6 text-white')}
        <Heading level={3} className="min-w-40">{modality && `Modality: ${modality?.modality}`}</Heading>
      </div>
      <Text variant='small' color='text-gray-600' className="min-w-50">
        {modality?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted' loadingHeight={20}>{modality?.description}</Text>
    </Panel>
  )
}