import { ZodiacSignType } from "mystyc-common";
import Heading from "@/components/ui/Heading";
import Link from "@/components/ui/Link";
import Panel from "@/components/ui/Panel";
import { getZodiacIcon } from "@/components/ui/icons/astrology/zodiac";
import Text from "@/components/ui/Text";

export default function AstrologyLinkPanel({ sign, label, sublabel } : { sign: ZodiacSignType, label: string, sublabel: string }) {
  return (
    <Link href={`/astrology/signs/${sign}`} className="hover:!no-underline">
      <Panel className="items-center justify-center aspect-square">
        {getZodiacIcon(sign, 'w-10 h-10 text-white')}
        <Heading level={2}>{sign}</Heading>
        <Text variant="muted" className="!mt-2">{label}</Text>
        <Text variant="xs">{sublabel}</Text>
      </Panel>
    </Link>
  );
}