import { Zap } from "lucide-react";

import { EnergyType } from "mystyc-common";
import { formatStringForDisplay } from "@/util/util";
import { getCategoryIcon } from "@/components/ui/icons/astrology/categories";
import Text from "@/components/ui/Text";
import Heading from "@/components/ui/Heading";

interface AggregatedEnergyType {
  category: string;
  descriptions: Set<string>;
  keywords: Set<string>;
  intensity: number;
}

interface AggregatedEnergyData {
  [category: string]: AggregatedEnergyType;
}

export default function EnergyTypesPanel({ energyTypes } : { energyTypes: EnergyType[] | null }) {
  // Extract all energyTypeData objects
  const energyTypesUnique = energyTypes ? energyTypes?.filter(Boolean) : [];

  // Aggregate by category
  const aggregatedData: AggregatedEnergyData = energyTypesUnique.reduce((acc: AggregatedEnergyData, energyType) => {
    if (!energyType) {
      return acc;
    }

    const category = energyType.category;
    
    if (!acc[category]) {
      acc[category] = {
        category,
        descriptions: new Set<string>(),
        keywords: new Set<string>(),
        intensity: energyType.intensity
      };
    }
    
    (acc[category].descriptions as Set<string>).add(energyType.description);
    energyType.keywords.forEach((keyword: string) => acc[category].keywords.add(keyword));
    
    return acc;
  }, {});

  const categories: AggregatedEnergyType[] = Object.values(aggregatedData);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col space-y-2">
        <div className='flex items-center space-x-2'>
          <Heading level={3} className="min-w-40"></Heading>
        </div>
        <Text variant='small' color='text-gray-600' className="min-w-50"></Text>
        <Text variant='muted' loadingHeight={20}></Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-10">
      {categories.map((categoryData) => (
        <div key={categoryData.category} className="space-y-2 !bg-transparen1t">
          <div className="flex">
            <div className="flex w-full items-center space-x-2">
              <div className="p-1 rounded-full bg-blue-500">
                {getCategoryIcon(categoryData.category, 'w-3 h-3 text-white')} 
              </div>
              <Heading level={3} className="flex items-center flex-1 !text-white">
                {formatStringForDisplay(categoryData.category)} Energy <Zap className="w-3 h-3 ml-2 text-white" />
              </Heading>
            </div>
          </div>

          <Text variant='small' color='text-gray-600'>
            {Array.from(categoryData.keywords).map((word: string) => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(", ")}
          </Text>

          <Text variant='muted' className="mt-1">
            {[...(categoryData.descriptions as Set<string>)].join(". ")}
          </Text>
        </div>
      ))}
    </div>
  );
}