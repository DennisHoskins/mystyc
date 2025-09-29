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
  const bgColor1 = interaction?.sign1Data.element ? interactionColors[interaction?.sign1Data.element] : "#333333";
  const bgColor2 = interaction?.sign2Data.element ? interactionColors[interaction?.sign2Data.element] : "#333333";

  return (
    <Card>
      <div className='flex items-center space-x-2'>
        {interaction &&
          <>
            <div className="p-[5px] mr-[2px] flex items-center justify-center rounded-md" style={{ backgroundColor: bgColor1 }}>
              {getElementIcon(interaction?.sign1Data.element, 'w-4 h-4 text-white')}
            </div>
            <div className="p-[5px] flex items-center justify-center rounded-md" style={{ backgroundColor: bgColor2 }}>
              {getElementIcon(interaction?.sign2Data.element, 'w-4 h-4 text-white')}
            </div>
          </>
        }
        {interaction && <Heading level={3} className="flex"><span className="hidden md:block mr-2">Elements: </span>{interaction?.sign1Data.element} - {interaction?.sign2Data.element}</Heading>}
        {!interaction && <Heading level={3} className="flex w-40"></Heading>}
      </div>
      <Text variant='small' color='text-gray-500' className="!mt-2">
        {interaction?.elementInteractionData?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <div className="!-mt-1 w-full max-w-md">
        <LinearGauge score={interaction?.elementScore} label="" />
      </div>

      <Text variant='muted' color='text-gray-400' className="!mt-2" loadingHeight={15}>{interaction?.elementInteractionData?.description}</Text>

      <div className='flex items-center space-x-2 !mt-2'>
        <Heading level={5} color='text-gray-300'>{interaction && `Dynamic: ${formatStringForDisplay(interaction?.elementInteractionData?.dynamic)}`}</Heading>
        {interaction && getDynamicIcon(interaction?.elementInteractionData?.dynamic, 'w-3 h-3 text-gray-300')}
      </div>

      <Text variant='xs' color='text-gray-500' className="!mt-2 w-40">{interaction && `Keys to success`}</Text>
      <Text variant='muted' color="text-gray-400">{interaction?.elementInteractionData?.action}</Text>
    </Card>
  );
}
