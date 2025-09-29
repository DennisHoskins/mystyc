import { SignComplete } from "mystyc-common";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import RadialGauge from "../../../../ui/RadialGauge";
import Link from "@/components/ui/Link";
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";

export default function SignRadialPanel({ sign } : { sign: SignComplete | null | undefined }) {
  return (
    <div className="@container grid grid-cols-1 md:grid-cols-2 gap-2">
      <Panel className="!py-4 !px-8 flex flex-col justify-center min-h-32">
        <Link href={`/relationships/${sign?.bestInteraction?.sign2}`} className="flex flex-col @2xl:flex-row space-y-0 @2xl:space-y-4 space-x-2 hover:!no-underline">
          <RadialGauge 
            totalScore={sign?.bestInteraction?.totalScore} 
            label='Compatible'
            size={100} 
            inline={true}
            className="cursor-pointer"
          />
          <div className="flex flex-col justify-center text-center @2xl:text-left">
            <div className="flex items-center space-x-1 justify-center @2xl:justify-start">
              {sign && getZodiacIcon(sign?.bestInteraction?.sign2, '-ml-2 w-8 h-8 text-gray-300')}
              <Heading level={2}>{sign?.bestInteraction?.sign2}</Heading>
            </div>
            <Text variant="xs" color='text-gray-500'>Most Compatible</Text>
          </div>
        </Link>
      </Panel>

      <Panel className="!py-4 !px-8 flex flex-col space-y-2 justify-center min-h-32">
        <Link href={`/relationships/${sign?.worstInteraction?.sign2}`} className="flex flex-col @2xl:flex-row space-y-0 @2xl:space-y-4 space-x-2 hover:!no-underline">
          <RadialGauge 
            totalScore={sign?.worstInteraction?.totalScore} 
            label='Compatible'
            size={100} 
            inline={true}
            className="cursor-pointer"
          />
          <div className="flex flex-col justify-center text-center @2xl:text-left">
            <div className="flex items-center space-x-1 justify-center @2xl:justify-start">
              {sign && getZodiacIcon(sign?.worstInteraction?.sign2, '-ml-2 w-8 h-8 text-gray-300')}
              <Heading level={2}>{sign?.worstInteraction?.sign2}</Heading>
            </div>
            <Text variant="xs" color='text-gray-500'>Least Compatible</Text>
          </div>
        </Link>
      </Panel>
    </div>
  )
}