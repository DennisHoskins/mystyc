import { SignInteractionComplete } from "mystyc-common";
import { getModalityIcon } from "@/components/ui/icons/astrology/modalities";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Card from "@/components/ui/Card";
import LinearGauge from "@/components/mystyc/ui/LinearGauge";
import { getDynamicIcon } from "@/components/ui/icons/astrology/dynamics";
import { formatStringForDisplay } from "@/util/util";

export default function ModalityInteractionCard({ interaction } : { interaction: SignInteractionComplete | null | undefined }) {
  return (
    <Card>
      <div className='flex items-center space-x-2'>
        {interaction &&
          <>
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
              {interaction && getModalityIcon(interaction?.sign1Data.modality, 'w-4 h-4 text-white')}
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
              {interaction && getModalityIcon(interaction?.sign2Data.modality, 'w-4 h-4 text-white')}
            </div>
          </>
        }
        {interaction && <Heading level={3} className="flex"><span className="hidden md:block mr-2">Modalities: </span>{interaction?.sign1Data.modality} - {interaction?.sign2Data.modality}</Heading>}
        {!interaction && <Heading level={3} className="flex w-40"></Heading>}
      </div>
      <Text variant='small' color="text-gray-500 !mt-2">
        {interaction?.modalityInteractionData?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <div className="!-mt-1 w-full max-w-md">
        <LinearGauge score={interaction?.modalityScore} label="" />
      </div>

      <Text variant='muted' color='text-gray-400' className="!mt-2" loadingHeight={15}>{interaction?.modalityInteractionData?.description}</Text>

      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} color='text-gray-300'>{interaction && `Dynamic: ${formatStringForDisplay(interaction?.modalityInteractionData?.dynamic)}`}</Heading>
        {getDynamicIcon(interaction?.modalityInteractionData?.dynamic, 'w-3 h-3 text-gray-300')}
      </div>

      <Text variant='xs' color='text-gray-500' className="!mt-2">{interaction && `Keys to success`}</Text>
      <Text variant='muted' color="text-gray-400">{interaction?.modalityInteractionData?.action}</Text>
    </Card>
  );
}
