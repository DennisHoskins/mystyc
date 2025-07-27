import { Eye } from 'lucide-react';

import { Content } from 'mystyc-common/schemas';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function ContentPreviewCard({ content }: { content: Content | null }) {
  return (
    <Card>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={<Eye className='w-4 h-4'/>} />
        <div>
          <Heading level={5}>Preview</Heading>
        </div>
      </div>

      <hr/>

      {content?.status === 'failed' && content.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <Heading level={6} className="text-red-700 mb-2">Generation Error</Heading>
          <Text className="text-red-600">{content.error}</Text>
        </div>
      )}
      
      <div className="mt-4 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <Heading level={5} className="mb-3">{content?.title}</Heading>
          <Text className="text-gray-700">{content?.message}</Text>
        </div>

        <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide mb-2">
          Image Preview
        </Text>
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={content?.imageUrl} 
            alt={content?.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
            }}
          />
        </div>

        <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide mb-2">
          Call to Action
        </Text>
        <a 
          href={content?.linkUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {content?.linkText || 'Learn More'}
        </a>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${content?.data.length || 1} gap-4 mt-4`}>
        {content && content.data.map((item, index) => (
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