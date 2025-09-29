import { SignInteractionComplete } from "mystyc-common";
import { getPolarityIcon } from "@/components/ui/icons/astrology/polarities";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Card from "@/components/ui/Card";
import LinearGauge from "@/components/mystyc/ui/LinearGauge";
import { getDynamicIcon } from "@/components/ui/icons/astrology/dynamics";
import { formatStringForDisplay } from "@/util/util";

export default function PolarityInteractionCard({ interaction } : { interaction: SignInteractionComplete | null | undefined }) {
  return (
    <Card>
      <div className='flex items-center space-x-2'>
        {interaction &&
          <>
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
              {interaction && getPolarityIcon(interaction?.sign1Data.basics.polarity, 'w-5 h-5 text-white')}
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
              {interaction && getPolarityIcon(interaction?.sign2Data.basics.polarity, 'w-5 h-5 text-white')}
            </div>
          </>
        }
        {interaction && <Heading level={3} className="flex"><span className="hidden md:block mr-2">Polarities: </span>{interaction?.sign1Data.basics.polarity} - {interaction?.sign2Data.basics.polarity}</Heading>}
        {!interaction && <Heading level={3} className="flex w-40"></Heading>}
      </div>
      <Text variant='small' color='text-gray-500' className="!mt-2">
        {interaction?.polarityInteractionData?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <div className="!-mt-1 w-full max-w-md">
        <LinearGauge score={interaction?.polarityScore} label="" />
      </div>
      <Text variant='muted' color='text-gray-400' className="!mt-2" loadingHeight={15}>{interaction?.polarityInteractionData?.description}</Text>
      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} color='text-gray-300'>{interaction && `Dynamic: ${formatStringForDisplay(interaction?.polarityInteractionData?.dynamic)}`}</Heading>
        {getDynamicIcon(interaction?.polarityInteractionData?.dynamic, 'w-3 h-3 text-gray-300')}
      </div>
      <Text variant='xs' color='text-gray-500' className="!mt-2">{interaction && `Keys to success`}</Text>
      <Text variant='muted' color="text-gray-400">{interaction?.polarityInteractionData?.action}</Text>
    </Card>
  );
}
