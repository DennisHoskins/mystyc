'use client'

// import { useState } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';

import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import Button from '@/components/ui/Button';

export default function SuccessPanel({ user } : { user: AppUser }) {
  // const [isWorking, setWorking] = useState(false);

  if (!user) {
    return null;
  }

  const handleSubmit = () => {
    // go to /
  }

  return (
    <FormLayout subtitle='You are all set!'>
      <Form onSubmit={handleSubmit}>
        <Button
          type="submit"
          // loading={isWorking}
          loadingContent="Working..."
          className="w-full mt-6"
        >
          OK
        </Button>
      </Form>
    </FormLayout>
  );
}