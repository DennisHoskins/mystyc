'use client';

import { Content } from 'mystyc-common';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function ContentDataCard({ content }: { content: Content }) {
  if (!content.data || content.data.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <Heading level={4} className="mb-6">Wisdom</Heading>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.data.map((item, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100 hover:shadow-lg transition-shadow"
          >
            <Heading level={6} className="text-purple-900 mb-2">
              {item.key}
            </Heading>
            <Text className="text-gray-700 text-sm italic">
              {item.value}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
}