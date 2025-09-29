import { ZodiacSignType } from "mystyc-common";
import Heading from "@/components/ui/Heading";
import Link from "@/components/ui/Link";
import Panel from "@/components/ui/Panel";
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";
import Text from "@/components/ui/Text";
import Card from "@/components/ui/Card";

export default function AstrologyLinkPanel({ sign, label, sublabel } : { sign: ZodiacSignType, label: string, sublabel: string }) {
  return (
    <Link href={`/astrology/signs/${sign}`} className="hover:!no-underline">
      <Card padding={4} className="!pb-8 items-center">
        <Panel className="items-center justify-center mb-4">
          {getZodiacIcon(sign, 'w-16 h-16 text-white')}
        </Panel>
        <Heading level={2}>{sign}</Heading>
        <Text color='text-gray-300' variant="small" className="!mt-1 font-bold">{label}</Text>
        <Text variant="xs">{sublabel}</Text>
      </Card>
    </Link>
  );
}