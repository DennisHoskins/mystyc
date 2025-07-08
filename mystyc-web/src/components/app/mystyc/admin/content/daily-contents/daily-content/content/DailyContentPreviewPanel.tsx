'use client';

import { DailyContent } from '@/interfaces';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function DailyContentPreviewPanel({ content }: { content: DailyContent }) {
  return (
    <Card className="p-6">
      <Heading level={4} className="mb-4">Content Preview</Heading>
      
      <div className="space-y-6">
        {/* Title and Message */}
        <div className="bg-gray-50 rounded-lg p-6">
          <Heading level={5} className="mb-3">{content.title}</Heading>
          <Text className="text-gray-700">{content.message}</Text>
        </div>

        {/* Image Preview */}
        {content.imageUrl && (
          <div>
            <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide mb-2">
              Image Preview
            </Text>
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={content.imageUrl} 
                alt={content.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        )}

        {/* Link Button Preview */}
        {content.linkUrl && (
          <div>
            <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide mb-2">
              Call to Action
            </Text>
            <a 
              href={content.linkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {content.linkText || 'Learn More'}
            </a>
          </div>
        )}

        {/* Error Display */}
        {content.status === 'failed' && content.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <Heading level={6} className="text-red-700 mb-2">Generation Error</Heading>
            <Text className="text-red-600">{content.error}</Text>
          </div>
        )}
      </div>
    </Card>
  );
}