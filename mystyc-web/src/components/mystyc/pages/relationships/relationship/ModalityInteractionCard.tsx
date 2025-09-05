import { SignInteractionComplete } from "mystyc-common";
import { getModalityIcon } from "@/components/ui/icons/astrology/modalities";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Card from "@/components/ui/Card";
import LinearGauge from "@/components/mystyc/ui/LinearGauge";
import { getDynamicIcon } from "@/components/ui/icons/astrology/dynamics";
import { formatStringForDisplay } from "@/util/util";

export default function ModalityInteractionCard({ interaction } : { interaction: SignInteractionComplete | null | undefined }) {
  if (!interaction || !interaction.modalityInteractionData) {
    return null;
  }

  return (
    <Card className={`!p-10`}>
      <div className='flex items-center space-x-2'>
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
          {getModalityIcon(interaction.sign1Data.modality, 'w-4 h-4 text-white')}
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
          {getModalityIcon(interaction.sign2Data.modality, 'w-4 h-4 text-white')}
        </div>
        <Heading level={3}>Modalities: {interaction.sign1Data.modality} - {interaction.sign2Data.modality}</Heading>
      </div>
      <Text variant='small' className="!text-gray-500 !mt-2">
        {interaction.modalityInteractionData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <div className="!mt-2 w-full max-w-md">
        <LinearGauge score={interaction.modalityScore} label="" />
      </div>

      <Text variant='muted' className="!text-gray-400 !mt-2">{interaction.modalityInteractionData.description}</Text>

      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} className='!text-gray-300'>Dynamic: {formatStringForDisplay(interaction.modalityInteractionData.dynamic)}</Heading>
        {getDynamicIcon(interaction.modalityInteractionData.dynamic, 'w-3 h-3 text-gray-300')}
      </div>

      <Text variant='xs' className="!text-gray-500 !mt-2">Keys to success</Text>
      <Text variant='muted' className="!text-gray-400">{interaction.modalityInteractionData.action}</Text>
    </Card>
  );
}
