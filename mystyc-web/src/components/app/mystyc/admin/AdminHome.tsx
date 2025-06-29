'use client';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function AdminHome() {
  return(
    <Card>
      <Heading level={2}>Admin</Heading>
      <Text>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
    </Card>
  );
};