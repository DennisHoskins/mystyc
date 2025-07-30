'use client'

import { useState, useEffect } from 'react';

import { Content } from 'mystyc-common/schemas/content.schema';

import { getContent } from '@/server/actions/content';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function WebsiteContent() {
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    getContent(getDeviceInfo())
      .then(setContent)
      .catch(err => logger.error(err.message));
  }, []);

  return (
    <>
      <Heading level={1} className="text-center mb-8">
        {content ? content.title + " @ " + content.date : ' Loading...'}
      </Heading>
      <Text  className="text-gray-600 mb-10 text-lg md:text-xl text-center mx-auto">{content ? content.message : ''}</Text>
      {content && content.data && (
        <div className='mt-8 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[15em]'>
          {content.data.map((item, index) => (
            <Card key={index}>
              <Heading level={3}>{item.key}</Heading>
              <Text className='mt-2'>{item.value}</Text>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}