import { Sign } from "mystyc-common";
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function SignDetailsPanel({ sign } : { sign: Sign | null }) {
  if (!sign) {
    return null;
  }

  return (
    <>
      <div className='flex items-center space-x-1'>
        {getZodiacIcon(sign.sign, 'w-10 h-10 text-white -ml-2')}
        <Heading level={1}>{sign.sign}</Heading>
      </div>
      <Text variant='body'>{sign.description}</Text>
    </>
  )
}