'use client'

import { useState, useEffect } from 'react';

import { Content } from 'mystyc-common/schemas/content.schema';

import { getContent } from '@/server/actions/content';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Panel from '@/components/ui/Panel';
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
    <div className='flex flex-col'>
      <Heading level={1} className="text-center mb-16">
        {content ? content.title + " @ " + content.date : ' Loading...'}
      </Heading>
      <Text  className="!text-gray-500 mb-10 text-lg text-center mx-auto">{content ? content.message : ''}</Text>
      {content && content.data && (
        <div className='mt-8 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[15em]'>
          {content.data.map((item, index) => (
            <Panel key={index}>
              <Heading level={3}>{item.key}</Heading>
              <Text className='mt-2 !text-gray-500'>{item.value}</Text>
            </Panel>
          ))}
        </div>
      )}
      {content && content.data && (
        <div className='mt-8 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[15em]'>
          {content.data.map((item, index) => (
            <Panel key={index}>
              <Heading level={3}>{item.key}</Heading>
              <Text className='mt-2 !text-gray-500'>{item.value}</Text>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}