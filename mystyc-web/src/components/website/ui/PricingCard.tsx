'use client'

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
  href: string;
}

export default function PricingCard({ 
  title, 
  description, 
  price, 
  features, 
  buttonText, 
  buttonVariant,
  href 
}: PricingCardProps) {
  const router = useTransitionRouter();

  return (
    <Card>
      <Heading level={3} className="mb-2 text-center">
        {title}
      </Heading>
      <Text className="text-gray-700 mb-4 text-center">
        {description}
      </Text>
      <Text className="text-3xl font-bold mb-4 text-center">{price}</Text>
      <ul className="text-gray-700 mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <Button
        variant={buttonVariant}
        onClick={() => router.push(href)}
        className="mt-auto"
      >
        {buttonText}
      </Button>
    </Card>
  );
}