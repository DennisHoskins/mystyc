'use client'

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';

import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function NamePanel({ user, setIsWorking } : { user: AppUser, setIsWorking: (working: boolean) => void }) {
  // const [isWorking, setWorking] = useState(false);
  // const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = async () => {
      setIsWorking(true);
      await new Promise(resolve => setTimeout(resolve, 2500));
      window.dispatchEvent(new CustomEvent('wizard-next'));
    }
    next();
  };

  return (
    <FormLayout 
      title="What's your name?"
      subtitle={
        <>
          Your name helps personalize your experience.
          <br />
          We’ll keep it private—just between us.
        </>
      } 
      error={null}
    >
      <Form onSubmit={handleSubmit}>
        <TextInput
          id="firstName"
          name="firstName"
          type="text"
          label='First Name'
          autoComplete="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          required
        />
        <TextInput
          id="lastName"
          name="lastName"
          type="text"
          label='Last Name'
          autoComplete="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          required
        />
        <Button
          type="submit"
          disabled={firstName.length == 0 && lastName.length == 0}
          // loading={isWorking}
          loadingContent="Working..."
          className="py-3 w-auto min-w-28 self-end flex items-center justify-center"
        >
          Next
          <ChevronRight className='h-4 w-4 ml-2 -mr-1 mt-[1.5px]' strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  );
}