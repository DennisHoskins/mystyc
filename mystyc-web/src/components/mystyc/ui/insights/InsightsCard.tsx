'use client';

import { useState, useEffect, useCallback } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { apiClient } from '@/api/apiClient';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { Content } from '@/interfaces/content.interface';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function Insights({ user } : { user: AppUser }) {
  const [data, setData] = useState<Content | null>(null);
  const { setBusy } = useBusy();

  const loadContent = useCallback(async () => {
    setBusy(1000);

    try {
      const reply = await apiClient.getUserContent();
      setData(reply);
    } catch (err) {
      logger.log(err);
    } finally {
      setBusy(false); 
    }
  }, [setBusy]);

  useEffect(() => {
    loadContent();
  }, [loadContent])

  if (!data) {
    return;
  }

  const name = user.userProfile.fullName?.split(" ")[0] || "Knowledge Seeker";
  const title = data.title.replaceAll("{USER_NAME}", name);
  const message = data.message.replaceAll("{USER_NAME}", name);

  return (
    <Card className="p-6 space-y-6 text-center">
      <Heading level={3}>{title}</Heading>
      {data ? (
        <>
          <Text>{message}</Text>

          {data && data.data && (
            <div className='flex-1 grid grid-cols-1 gap-6'>
              {data.data.map((item, index) => (
                <a
                  href={`/insights/${item.key.replaceAll(" ", "-").toLowerCase()}`}
                  key={index} 
                  className="border flex flex-col p-6 space-y-6 items-center hover:scale-[101%] transition-all bg-gray-50"
                >
                  <Heading level={3}>{item.key.replaceAll("{USER_NAME}", name)}</Heading>
                  <Text className='mt-2'>{item.value.replaceAll("{USER_NAME}", name)}</Text>
                  <Text className="bg-gray-600 text-white p-2 rounded-full w-full max-w-lg mt-6">
                    Find out more...
                  </Text>
                </a>
              ))}
            </div>
          )}

        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </Card>
  );
}