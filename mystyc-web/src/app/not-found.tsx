'use client'

import Link from 'next/link';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import ParallaxContainer from '@/components/ui/parallax/ParallaxContainer';
import WebsiteFooter from '@/components/website/WebsiteFooter';

export default function NotFound() {
  return (
    <>
      <ParallaxContainer className='!fixed w-full h-full !overflow-hidden'><></></ParallaxContainer>
      <div className="flex flex-col flex-1 w-full min-h-fit justify-center items-center">
        <Card>
          <div className="text-center">
            <Heading level={1} size="xl" className="sm:text-5xl">
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
        </Card>        
      </div>
      <WebsiteFooter />
    </>
  );
}