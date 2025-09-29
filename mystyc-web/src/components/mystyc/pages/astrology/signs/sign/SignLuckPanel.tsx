import { CalendarDays, Clock, Clover } from "lucide-react";

import { Sign } from "mystyc-common";
import Text from "@/components/ui/Text";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";

const colorHex: Record<string, string> = {
  "Multicolor": "linear-gradient(90deg, #FF0000, #FFA500, #FFFF00, #008000, #0000FF, #4B0082, #EE82EE)",
  "Green": "#008000",
  "Pink": "#FFC0CB",
  "Pastel Blue": "#AEC6CF",
  "Earth Tones": "#A0522D",
  "Yellow": "#FFFF00",
  "Light Blue": "#ADD8E6",
  "Silver": "#C0C0C0",
  "White": "#FFFFFF",
  "Sea Green": "#2E8B57",
  "Pale Blue": "#AFEEEE",
  "Gold": "#FFD700",
  "Orange": "#FFA500",
  "Red": "#FF0000",
  "Purple": "#800080",
  "Brown": "#8B4513",
  "Beige": "#F5F5DC",
  "Lavender": "#E6E6FA",
  "Sky Blue": "#87CEEB",
  "Pale Green": "#98FB98",
  "Black": "#000000",
  "Maroon": "#800000",
  "Dark Red": "#8B0000",
  "Burgundy": "#800020",
  "Deep Purple": "#673AB7",
  "Blue": "#0000FF",
  "Dark Green": "#006400",
  "Gray": "#808080",
  "Electric Blue": "#7DF9FF",
  "Turquoise": "#40E0D0",
  "Violet": "#EE82EE",
  "Lilac": "#C8A2C8",
  "Aqua": "#00FFFF",
  "Scarlet": "#FF2400",
  "Crimson": "#DC143C",
  "Bright Yellow": "#FFEA00",
};

export default function SignLuckPanel({ sign } : { sign: Sign | null }) {
  return (
    <div className="flex flex-col space-y-2">
      <div className='flex items-center space-x-2'>
        <Clover className='w-6 h-6 text-white' />
        <Heading level={3}>Luck</Heading>
      </div>
      <div className="grid grid-cols-5 gap-2 w-full">
        <Panel padding={4} className="!flex-row items-center space-x-2 col-span-2">
          <CalendarDays className="w-10 h-10 mr-2 text-gray-500 stroke-[1.5px]" />
          <div className="flex flex-col">
            <Text variant='xs' color="text-gray-500">Lucky Day</Text>
            <Text variant="small" className="flex items-center min-w-14">{sign?.lucky.day}</Text>
          </div>
        </Panel>
        <Panel padding={4} className="!flex-row items-center space-x-2 col-span-3">
          <Clock className="w-10 h-10 mr-2 text-gray-500 stroke-[1.5px]" />
          <div className="flex flex-col">
            <Text variant='xs' color="text-gray-500">Lucky Times</Text>
            <Text variant="small" className="flex items-center min-w-28">{sign?.lucky.times}</Text>
          </div>
        </Panel>
      </div>
      <Panel padding={4} className="flex flex-col space-y-2 min-h-20">
        <Text variant='xs' color="text-gray-500">Lucky Numbers</Text>
        <div className='flex space-x-4'>
          {sign?.lucky.numbers.map((num, i) => (
              <div key={i} className="w-10 aspect-square rounded-md bg-gray-400 flex items-center justify-center">
                <Text color='text-white' className="font-bold text-[24px]">{num}</Text>
              </div>
          ))}
        </div>
      </Panel>
      <Panel padding={4} className="flex flex-col space-y-2 min-h-20">
        <Text variant='xs' color="text-gray-500">Lucky Colors</Text>
        <div className='flex space-x-2'>
          {sign?.lucky.colors.map((color) => {
            const normalized = color.trim().toLowerCase();
            const entry = Object.entries(colorHex).find(
              ([key]) => key.toLowerCase() === normalized
            );
            const hex = entry?.[1] || "#ccc"; // fallback grey
            const style = hex.startsWith("linear-gradient")
              ? { background: hex }
              : { backgroundColor: hex };

            return (
              <div key={color} className="flex flex-col items-center min-w-20 space-y-2">
                <div className="w-10 aspect-square rounded-md border border-gray-400" style={style}></div>
                <Text variant="muted">{color}</Text>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
