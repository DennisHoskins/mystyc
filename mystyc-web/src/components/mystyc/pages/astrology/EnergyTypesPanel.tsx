import { Zap } from "lucide-react";

import { SignComplete } from "mystyc-common";
import { formatStringForDisplay } from "@/util/util";
import { getCategoryIcon } from "@/components/ui/icons/astrology/categories";
import Text from "@/components/ui/Text";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";

interface AggregatedEnergyType {
  category: string;
  descriptions: string[];
  keywords: Set<string>;
  intensity: number;
}

interface AggregatedEnergyData {
  [category: string]: AggregatedEnergyType;
}

export default function EnergyTypesPanel({ sign } : { sign: SignComplete | null }) {
  if (!sign) {
    return null;
  }

  // Extract all energyTypeData objects
  const energyTypes = [
    sign.energyTypeData,
    sign.houseData?.energyTypeData,
    sign.elementData?.energyTypeData,
    sign.modalityData?.energyTypeData,
    sign.polarityData?.energyTypeData,
  ].filter(Boolean);

  // Aggregate by category
  const aggregatedData: AggregatedEnergyData = energyTypes.reduce((acc: AggregatedEnergyData, energyType) => {
    if (!energyType) {
      return acc;
    }

    const category = energyType.category;
    
    if (!acc[category]) {
      acc[category] = {
        category,
        descriptions: [],
        keywords: new Set<string>(),
        intensity: energyType.intensity
      };
    }
    
    acc[category].descriptions.push(energyType.description);
    energyType.keywords.forEach((keyword: string) => acc[category].keywords.add(keyword));
    
    return acc;
  }, {});

  const categories: AggregatedEnergyType[] = Object.values(aggregatedData);

  if (categories.length === 0) {
    return null;
  }

  return (
    <Panel className="!p-12">
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

            <Text variant='small' className='!text-gray-600'>
              {Array.from(categoryData.keywords).map((word: string) => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(", ")}
            </Text>

            <Text variant='muted' className="mt-1">
              {categoryData.descriptions.join(". ")}
            </Text>
          </div>
        ))}
      </div>
    </Panel>
  );
}