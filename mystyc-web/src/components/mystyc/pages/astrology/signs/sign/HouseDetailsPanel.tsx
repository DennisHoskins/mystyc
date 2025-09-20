import { HouseComplete } from "mystyc-common";
import { getHouseIcon } from "@/components/ui/icons/astrology/houses";
import Panel from "@/components/ui/Panel";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";

export default function HouseDetailsPanel({ house, className } : { house: HouseComplete | null | undefined, className?: string }) {
  const getRomanNumeral = (num: number): string => {
    const romanNumerals = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ', 'Ⅹ', 'Ⅺ', 'Ⅻ'];
    return romanNumerals[num - 1] || num.toString();
  };

  const lifeAreaWords = house?.lifeArea.split(',').flatMap(segment => segment.trim().split(' '));
  const keywordWords = house?.keywords.flatMap(k => k.split(' '));
  const allWordsLower = (lifeAreaWords && keywordWords) ? [...lifeAreaWords, ...keywordWords].map(w => w.toLowerCase()) : [];
  const uniqueWordsSet = new Set(allWordsLower);

  const uniqueWords = Array.from(uniqueWordsSet)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(', ');

  return (
    <Panel className={`${className} space-y-2`}>
      <div className='flex items-center space-x-2'>
        {getHouseIcon(house?.name.replace("House of ", ""), 'w-6 h-6 text-white')}
        <Heading level={3}>{house ? getRomanNumeral(house?.houseNumber) : '  '}{house ? ": " + house.name : ''}</Heading>
      </div>
      <Text variant='small'>
        {uniqueWords}
      </Text>
      <Text variant='muted' loadingHeight={10} >{house?.description}</Text>
    </Panel>
  );
}