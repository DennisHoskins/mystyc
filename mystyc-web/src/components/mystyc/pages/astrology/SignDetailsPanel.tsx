import { SignComplete } from "mystyc-common";
import Text from "@/components/ui/Text";
import { getSignIcon } from "@/components/ui/icons/astrology/signs";
import Heading from "@/components/ui/Heading";

function linkFigures(story: string, figures: string[]) {
  const escapedFigures = figures.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escapedFigures.join("|")})`, "gi");

  const parts = story.split(regex);

  return parts.map((part, i) => {
    const match = figures.find(f => f.toLowerCase() === part.toLowerCase());
    if (match) {
      const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(match)}`;
      return (
        <a
          key={i}
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-100 underline hover:text-purple-400"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function SignDetailsPanel({ sign } : { sign: SignComplete | null }) {
  if (!sign) {
    return null;
  }

  return (
    <div className="flex flex-col p-6 space-y-4">
      <div className="flex space-x-2 items-center">
        {getSignIcon(sign.symbol.name, 'h-6 w-6 text-white')}
        <Heading level={1}>The {sign.symbol.name}</Heading>
      </div>
      <Text variant='small' className="!text-gray-500 !mt-2">
        {sign.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted' className="!mt-2 !text-gray-400">{sign.description}</Text>
      <Text variant='muted' className="!text-gray-400">
        {linkFigures(sign.symbol.mythologicalStory, sign.symbol.mythologicalFigures)}
      </Text>
      <Text variant='muted' className="!text-gray-400">
        {sign.symbol.description}
      </Text>
    </div>
  )
}
