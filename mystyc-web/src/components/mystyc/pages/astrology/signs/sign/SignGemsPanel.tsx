import { Gem } from "lucide-react";

import { Sign } from "mystyc-common";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Panel from "@/components/ui/Panel";

const gemHex: Record<string, string> = {
  // Birthstones
  "Diamond": "#B9F2FF",
  "Bloodstone": "#2A7F62",
  "Emerald": "#50C878",
  "Sapphire": "#0F52BA",
  "Agate": "#D4A017",
  "Pearl": "#FDEEF4",
  "Ruby": "#E0115F",
  "Moonstone": "#F0E5D6",
  "Peridot": "#B4D335",
  "Onyx": "#353839",
  "Opal": "#A8C3BC",
  "Lapis Lazuli": "#26619C",
  "Topaz": "#FFC87C",
  "Malachite": "#0BDA51",
  "Turquoise": "#40E0D0",
  "Garnet": "#733635",
  "Amethyst": "#9966CC",
  "Aquamarine": "#7FFFD4",

  // Crystals
  "Rose Quartz": "#F7CAC9",
  "Jade": "#00A86B",
  "Green Aventurine": "#3D9970",
  "Citrine": "#E4D00A",
  "Tiger’s Eye": "#B8860B",
  "Blue Lace Agate": "#A7C7E7",
  "Clear Quartz": "#EAEAEA",
  "Selenite": "#EEE8F0",
  "Chalcedony": "#B0E0E6",
  "Sunstone": "#FFCC99",
  "Amber": "#FFBF00",
  "Amazonite": "#3B9C9C",
  "Carnelian": "#B31B1B",
  "Moss Agate": "#8A9A5B",
  "Blue Kyanite": "#3A75C4",
  "Tourmaline": "#FF69B4",
  "Labradorite": "#6E7F80",
  "Obsidian": "#0B0B0B",
  "Black Tourmaline": "#1A1A1A",
  "Sodalite": "#4A90E2",
  "Smoky Quartz": "#6B4423",
  "Jet": "#343434",
  "Hematite": "#3D3C3A",
  "Fluorite": "#A6E7E3",
  "Angelite": "#B7CFE9",
  "Red Jasper": "#B22222",
};

export default function SignGemsPanel({ sign } : { sign: Sign | null }) {
  const renderGem = (gem: string) => {
    const normalized = gem.trim().toLowerCase();
    const entry = Object.entries(gemHex).find(
      ([key]) => key.toLowerCase() === normalized
    );
    const hex = entry?.[1] || "#ccc";
    return (
      <div key={gem} className="flex items-center space-x-3">
        <div className="w-3 h-3 rotate-45 border border-gray-400" style={{ backgroundColor: hex }}></div>
        <Text variant="muted">{gem}</Text>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        <Gem className='w-6 h-6 text-white' />
        <Heading level={3}>Gems</Heading>
      </div>

      <Text variant='small' color="text-gray-500">
        {sign?.gems.meanings.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <Panel padding={4} className="flex flex-col space-y-2 !mt-2 min-h-20">
        <Text variant='xs' color="text-gray-500">Birthstones</Text>
        <div className="flex space-x-6">
          {sign?.gems.birthstones.map(renderGem)}
        </div>
      </Panel>

      <Panel padding={4} className="col-span-2 flex flex-col space-y-2 min-h-20">
        <Text variant='xs' color="text-gray-500">Crystals</Text>
        <div className="flex space-x-6">
          {sign?.gems.crystals.map(renderGem)}
        </div>
      </Panel>
   </div>
  );
}
