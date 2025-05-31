'use client';

import Link from 'next/link';

import PageContainer from '@/components/layout/PageContainer';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';

export default function NotFound() {
  return (
    <PageContainer>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Page Not Found
        </h1>
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