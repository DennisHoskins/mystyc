'use client'

import { useState } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';

import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function NamePanel({ user } : { user: AppUser }) {
  // const [isWorking, setWorking] = useState(false);
  // const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    // <FormLayout subtitle="Enter your first and last name so I know who I'm talking to" error={error}>
    <FormLayout subtitle="Enter your first and last name so I know who I'm talking to" error={null}>
      <Form onSubmit={handleSubmit}>
        <TextInput
          id="firstName"
          name="firstName"
          type="text"
          label='Enter your First Name'
          autoComplete="First Name"
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        <TextInput
          id="lastName"
          name="lastName"
          type="text"
          label='Enter your Last Name'
          autoComplete="Last Name"
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
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