import { SignInteractionComplete } from "mystyc-common";
import { getPolarityIcon } from "@/components/ui/icons/astrology/polarities";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Card from "@/components/ui/Card";
import LinearGauge from "@/components/mystyc/ui/LinearGauge";
import { getDynamicIcon } from "@/components/ui/icons/astrology/dynamics";
import { formatStringForDisplay } from "@/util/util";

export default function PolarityInteractionCard({ interaction } : { interaction: SignInteractionComplete | null | undefined }) {
  if (!interaction || !interaction.polarityInteractionData) {
    return null;
  }

  return (
    <Card className={`!p-4 md:!p-10`}>
      <div className='flex items-center space-x-2'>
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
          {getPolarityIcon(interaction.sign1Data.basics.polarity, 'w-5 h-5 text-white')}
        </div>
        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#230537]">
          {getPolarityIcon(interaction.sign2Data.basics.polarity, 'w-5 h-5 text-white')}
        </div>
        <Heading level={3} className="flex"><span className="hidden md:block mr-2">Polarities: </span>{interaction.sign1Data.basics.polarity} - {interaction.sign2Data.basics.polarity}</Heading>
      </div>
      <Text variant='small' className="!text-gray-500 !mt-2">
        {interaction.polarityInteractionData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <div className="!mt-2 w-full max-w-md">
        <LinearGauge score={interaction.polarityScore} label="" />
      </div>

      <Text variant='muted' className="!text-gray-400 !mt-2">{interaction.polarityInteractionData.description}</Text>

      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} className='!text-gray-300'>Dynamic: {formatStringForDisplay(interaction.polarityInteractionData.dynamic)}</Heading>
        {getDynamicIcon(interaction.polarityInteractionData.dynamic, 'w-3 h-3 text-gray-300')}
      </div>

      <Text variant='xs' className="!text-gray-500 !mt-2">Keys to success</Text>
      <Text variant='muted' className="!text-gray-400">{interaction.polarityInteractionData.action}</Text>
    </Card>
  );
}
