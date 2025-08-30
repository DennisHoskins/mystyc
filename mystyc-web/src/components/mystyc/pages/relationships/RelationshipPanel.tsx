import { ZodiacSignType } from "mystyc-common"
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac"
import Panel from "@/components/ui/Panel"
import Text from "@/components/ui/Text"

export default function CompatibilityPanel({ sign } : { sign: ZodiacSignType }) {

  return (
    <Panel className="flex flex-col items-center justify-center">
      {getZodiacIcon(sign, 'w-10 h-10 text-white')}
      <Text variant='body' className="!text-white">{sign}</Text>
    </Panel>
  )
}