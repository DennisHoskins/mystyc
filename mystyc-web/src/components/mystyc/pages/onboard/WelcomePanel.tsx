'use client';

import { useState } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';

import FormLayout from '@/components/ui/form/FormLayout';
import Text from '@/components/ui/Text';
import Form from '@/components/ui/form/Form';
import Button from '@/components/ui/Button';

export default function WelcomePanel({ user } : { user: AppUser }) {
  const [isWorking, setWorking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <FormLayout subtitle="Welcome to Mystyc!">
      <Text>To get started, we need to gather some information...</Text>
      <Form onSubmit={handleSubmit}>
        <Button
          type="submit"
          loading={isWorking}
          loadingContent="Working..."
          className="w-full mt-6"
        >
          Let's Go!
        </Button>
      </Form>
    </FormLayout>
  );
}