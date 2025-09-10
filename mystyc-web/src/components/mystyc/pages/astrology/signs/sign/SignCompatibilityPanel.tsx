import { SignComplete } from "mystyc-common";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import RadialGauge from "../../../../ui/RadialGauge";
import Link from "@/components/ui/Link";
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";

export default function SignRadialPanel({ sign } : { sign: SignComplete | null | undefined }) {
  if (!sign) {
    return null;
  }

  return (
    <div className="flex space-x-2">
      <Panel className="!p-4 flex flex-col space-y-2 justify-center">
        <Link href={`/relationships/${sign.bestInteraction?.sign2}`} className="flex space-x-2 hover:!no-underline">
          <RadialGauge 
            totalScore={sign.bestInteraction?.totalScore || 0} 
            label='Compatible'
            size={100} 
            inline={true}
            className="cursor-pointer"
          />
          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-1">
              {getZodiacIcon(sign.bestInteraction?.sign2, '-ml-2 w-8 h-8 text-gray-300')}
              <Heading level={2}>{sign.bestInteraction?.sign2}</Heading>
            </div>
            <Text variant="xs" className='text-gray-500'>Most Compatible</Text>
          </div>
        </Link>
      </Panel>

      <Panel className="!p-4 flex flex-col space-y-2 justify-center">
        <Link href={`/relationships/${sign.worstInteraction?.sign2}`} className="flex space-x-2 hover:!no-underline">
          <RadialGauge 
            totalScore={sign.worstInteraction?.totalScore || 0} 
            label='Compatible'
            size={100} 
            inline={true}
            className="cursor-pointer"
          />
          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-1">
              {getZodiacIcon(sign.worstInteraction?.sign2, '-ml-2 w-8 h-8 text-gray-300')}
              <Heading level={2}>{sign.worstInteraction?.sign2}</Heading>
            </div>
            <Text variant="xs" className='text-gray-500'>Least Compatible</Text>
          </div>
        </Link>
      </Panel>
    </div>
  )
}