'use client';

import Link from 'next/link';

import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';

export default function NotFound() {
  return (
    <PageContainer>

      <div className="text-center">
        <Heading level={1} size="3xl" className="sm:text-5xl">
          Page Not Found
        </Heading>
        <Text className="mt-4">
          Sorry, we couldn&apos;t find the page you&apos;re looking for :(
        </Text>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button>Home</Button>
          </Link>
        </div>
      </div>
      
    </PageContainer>
  );
}