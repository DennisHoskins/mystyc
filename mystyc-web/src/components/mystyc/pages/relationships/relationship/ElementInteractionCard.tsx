import { SignInteractionComplete } from "mystyc-common";
import { getElementIcon } from "@/components/ui/icons/astrology/elements";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Card from "@/components/ui/Card";
import LinearGauge from "@/components/mystyc/ui/LinearGauge";
import { getDynamicIcon } from "@/components/ui/icons/astrology/dynamics";
import { formatStringForDisplay } from "@/util/util";

const interactionColors: Record<string, string> = {
  Air: "#9A9A9A",
  Water: "#00838F",
  Fire: "#E65100",
  Earth: "#1cab1a",
};

export default function ElementInteractionCard({ interaction } : { interaction: SignInteractionComplete | null | undefined }) {
  if (!interaction || !interaction.elementInteractionData) {
    return null;
  }

  const bgColor1 = interactionColors[interaction.sign1Data.element] || "#333333";
  const bgColor2 = interactionColors[interaction.sign2Data.element] || "#333333";

  return (
    <Card className={`!p-10`}>
      <div className='flex items-center space-x-2'>
        <div className="p-[5px] mr-[2px] flex items-center justify-center rounded-md" style={{ backgroundColor: bgColor1 }}>
          {getElementIcon(interaction.sign1Data.element, 'w-4 h-4 text-white')}
        </div>
        <div className="p-[5px] flex items-center justify-center rounded-md" style={{ backgroundColor: bgColor2 }}>
          {getElementIcon(interaction.sign2Data.element, 'w-4 h-4 text-white')}
        </div>
        <Heading level={3}>Elements: {interaction.sign1Data.element} - {interaction.sign2Data.element}</Heading>
      </div>
      <Text variant='small' className="!text-gray-500 !mt-2">
        {interaction.elementInteractionData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>


      <div className="!mt-2 w-full max-w-md">
        <LinearGauge score={interaction.elementScore} label="" />
      </div>

      <Text variant='muted' className="!text-gray-400 !mt-2">{interaction.elementInteractionData.description}</Text>

      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} className='!text-gray-300'>Dynamic: {formatStringForDisplay(interaction.elementInteractionData.dynamic)}</Heading>
        {getDynamicIcon(interaction.elementInteractionData.dynamic, 'w-3 h-3 text-gray-300')}
      </div>

      <Text variant='xs' className="!text-gray-500 !mt-2">Keys to success</Text>
      <Text variant='muted' className="!text-gray-400">{interaction.elementInteractionData.action}</Text>
    </Card>
  );
}
