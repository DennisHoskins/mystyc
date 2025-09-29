import { SignComplete } from "mystyc-common";
import Text from "@/components/ui/Text";
import { getSignIcon } from "@/components/ui/icons/astrology/signs";
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import Heading from "@/components/ui/Heading";

function linkFigures(story: string, figures: string[]) {
  const escapedFigures = figures.map(f => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  
  // Add word boundaries to avoid partial matches (e.g., Hera in Heracles)
  const regex = new RegExp(`\\b(${escapedFigures.join("|")})\\b`, "gi");

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
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2 items-center">
        {sign && getSignIcon(sign.symbol.name, 'h-6 w-6 text-white')}
        <Heading level={1} className="min-w-20">{sign && `The ${sign.symbol.name}`}</Heading>
      </div>
      <Text variant='small' color='text-gray-500' className="!mt-2">
        {sign?.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>
      <Text variant='muted' color='text-gray-400' className="!mt-2" loadingHeight={10}>{sign?.description}</Text>
      <Text variant='muted' color="text-gray-400" loadingHeight={10}>
        {sign && linkFigures(sign.symbol.mythologicalStory, sign.symbol.mythologicalFigures)}
      </Text>
      <Text variant='muted' color="text-gray-400">
        {sign?.symbol.description}
      </Text>
      {!sign && <Text variant='muted' className="max-w-40"></Text>}
      {sign &&
        <Text variant='muted' color='text-gray-400' className="flex items-center">
          Ruling Planet:
          {getPlanetIcon(sign.basics.rulingPlanet, 'w-4 h-5 text-white ml-2')}
          {<a href={`https://en.wikipedia.org/wiki/${sign?.basics.rulingPlanet}`} className="flex space-x-1 mr-2 text-purple-100 underline hover:text-purple-400">
            {sign?.basics.rulingPlanet}
          </a>}
          {(sign?.basics.modernRulingPlanet && sign?.basics.modernRulingPlanet != sign?.basics.rulingPlanet) && 
            <>
              <>/</>
              {getPlanetIcon(sign.basics.modernRulingPlanet, 'w-4 h-5 text-white ml-2')}
              <a href={`https://en.wikipedia.org/wiki/${sign.basics.modernRulingPlanet}`} className="flex space-x-1 text-purple-100 underline hover:text-purple-400">
                {sign.basics.modernRulingPlanet}
              </a>
            </>
          }
        </Text>
      }
    </div>
  )
}
