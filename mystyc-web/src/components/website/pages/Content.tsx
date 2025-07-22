'use client';

import { useState, useEffect } from 'react';

import { apiClient } from '@/api/apiClient';
import { Content } from 'mystyc-common/schemas/content.schema';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Card from '@/components/ui/Card';

export default function WebsiteContent() {
  const [data, setData] = useState<Content | null>(null);

  const loadContent = async () => {
    const reply = await apiClient.getContent();
    setData(reply);
  }

  useEffect(() => {
    loadContent();
  }, [])

  return (
    <>
      <Heading level={1} className="text-center mb-8">
        {data ? data.title + " @ " + data.date : ' Loading...'}
      </Heading>
      <Text  className="text-gray-600 mb-10 text-lg md:text-xl text-center mx-auto">{data ? data.message : ''}</Text>
      {data && data.data && (
        <div className='mt-8 flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[15em]'>
          {data.data.map((item, index) => (
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