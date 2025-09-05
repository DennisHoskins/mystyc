import { AstrologyComplete, User } from 'mystyc-common';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Link from '@/components/ui/Link';

export default function ProfileHeaderPanel({ user, astrology } : { user: User, astrology: AstrologyComplete }) {

  const aisummary = {
    "patterns": {
      "themes": [
        "Strong Pisces influence across identity, emotions, and relationships.",
        "Balance between softness (Pisces) and strength (Scorpio/Taurus).",
        "Recurring theme of 'water nourishes earth, earth contains water' — emotional depth paired with structure and persistence.",
        "Tension between change/flexibility (Pisces) and stability/consistency (Taurus/Scorpio)."
      ]
    },
    "core_snapshot": "An empathetic, intuitive person who combines deep compassion with persistence and intensity. Strong creative and emotional sensitivity pairs with determination to build and sustain. Growth comes from balancing flexibility with grounding and learning to manage emotions without being consumed by them."    
  }

  return (
    <div className='flex flex-col space-y-4'>
      <Link href={`/astrology/signs/${user.userProfile?.astrology?.sun.sign}`} className='flex items-center hover:!no-underline'>
        {getZodiacIcon(user.userProfile?.astrology?.sun.sign, "w-8 h-8 ml-1 text-white")}
        <Heading level={1} className='!text-white ml-1'>{user.userProfile?.astrology?.sun.sign}</Heading>
      </Link>

      <Text variant='small' className="!text-gray-500 !mt-1 flex space-x-2">
        {astrology.sun.signData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <Text variant='muted' className="!text-gray-400 !mt-2">{aisummary.core_snapshot}</Text>
      <Text variant='muted' className="!text-gray-400 !mt-4">{aisummary.patterns.themes.join(" ")}</Text>
    </div>
  );
}
